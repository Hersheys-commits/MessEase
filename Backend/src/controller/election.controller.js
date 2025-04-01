import { Application, ElectionConfig, Vote } from "../model/election.model.js";
import User from "../model/user.model.js";
import Hostel from "../model/hostel.model.js";
import Mess from "../model/mess.model.js";
import mongoose from "mongoose";
import College from "../model/college.model.js";

// Helper functions
const getTargetName = async (targetId) => {
  let name = null;
  const hostel = await Hostel.findById(targetId).select("name");
  if (hostel) return hostel.name;

  const mess = await Mess.findById(targetId).select("name");
  return mess?.name || null;
};

const validateTarget = async (type, targetId) => {
  return type === "messManager"
    ? await Mess.findById(targetId)
    : await Hostel.findById(targetId);
};

// ADMIN CONTROLLERS

// Get all election configurations
export const getAllElectionConfigs = async (req, res) => {
  try {
    const collegeId = req.user.college;
    const electionConfigs = await ElectionConfig.find({ college: collegeId })
      .populate("targetId")
      .sort({ createdAt: -1 })
      .lean();

    // Add name property to each config
    const configsWithNames = await Promise.all(
      electionConfigs.map(async (config) => {
        if (config.targetId && config.targetId._id) {
          try {
            const name = await getTargetName(config.targetId._id);
            if (name) config.name = name;
          } catch (err) {
            console.error(
              `Error finding name for targetId ${config.targetId._id}:`,
              err
            );
          }
        }
        return config;
      })
    );

    return res.status(200).json({
      success: true,
      data: configsWithNames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election configurations",
      error: error.message,
    });
  }
};

// Create a new election configuration
export const createElectionConfig = async (req, res) => {
  try {
    const { type, targetId, questions } = req.body;
    const college = req.user.college;

    // Validate target exists
    const targetExists = await validateTarget(type, targetId);
    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${type === "messManager" ? "Mess" : "Hostel"} not found`,
      });
    }

    // Check if an active election already exists
    const activeElection = await ElectionConfig.findOne({
      type,
      targetId,
      $or: [
        { "applicationPhase.isOpen": true },
        { "votingPhase.isOpen": true },
        { "result.winnerId": { $exists: false } },
      ],
    });

    if (activeElection) {
      return res.status(400).json({
        success: false,
        message: "An active election already exists for this target",
        castAlready: true,
      });
    }

    const newElectionConfig = new ElectionConfig({
      type,
      targetId,
      "applicationPhase.questions": questions,
      college,
    });

    await newElectionConfig.save();

    return res.status(201).json({
      success: true,
      message: "Election configuration created successfully",
      data: newElectionConfig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create election configuration",
      error: error.message,
    });
  }
};

// Toggle application phase
export const toggleApplicationPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Cannot open application if voting is open
    if (!election.applicationPhase.isOpen && election.votingPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Cannot open applications while voting is in progress",
      });
    }

    // Toggle state and record timestamp
    election.applicationPhase.isOpen = !election.applicationPhase.isOpen;
    election.applicationPhase[
      election.applicationPhase.isOpen ? "openedAt" : "closedAt"
    ] = new Date();

    await election.save();

    return res.status(200).json({
      success: true,
      message: `Application phase ${election.applicationPhase.isOpen ? "opened" : "closed"} successfully`,
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle application phase",
      error: error.message,
    });
  }
};

// Select candidates from applications
export const selectCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationIds } = req.body;

    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Application phase should be closed
    if (election.applicationPhase.isOpen) {
      return res.status(200).json({
        success: false,
        phase: true,
        message: "Close application phase before selecting candidates",
      });
    }

    // Validate all applicationIds
    const applications = await Application.find({
      _id: { $in: applicationIds },
      position: election.type,
      targetId: election.targetId,
    });

    if (applications.length !== applicationIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more application IDs are invalid",
      });
    }

    // Use bulkWrite for better performance
    const bulkOps = [
      {
        // Approve selected applications
        updateMany: {
          filter: { _id: { $in: applicationIds } },
          update: { status: "approved" },
        },
      },
      {
        // Reject other applications
        updateMany: {
          filter: {
            position: election.type,
            targetId: election.targetId,
            _id: { $nin: applicationIds },
          },
          update: { status: "rejected" },
        },
      },
    ];

    await Application.bulkWrite(bulkOps);

    // Update candidates list
    election.votingPhase.candidates = applications.map((app) => ({
      applicationId: app._id,
      userId: app.user,
    }));

    await election.save();

    return res.status(200).json({
      success: true,
      message: "Candidates selected successfully",
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to select candidates",
      error: error.message,
    });
  }
};

// Helper function to calculate results
const calculateResults = async (electionId) => {
  // Use aggregation for better performance
  const voteResults = await Vote.aggregate([
    { $match: { election: new mongoose.Types.ObjectId(electionId) } },
    { $group: { _id: "$candidate", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  if (voteResults.length > 0) {
    const winnerId = voteResults[0]._id;
    const maxVotes = voteResults[0].count;

    const winner = await User.findById(winnerId)
      .select("name branch year email")
      .lean();
    const winnerWithVoteCount = { ...winner, voteCount: maxVotes };

    // Update election with winner
    const election = await ElectionConfig.findByIdAndUpdate(
      electionId,
      {
        "result.winnerId": winnerWithVoteCount,
        "result.announcedAt": new Date(),
      },
      { new: true }
    );

    // Update user role based on election type
    if (election) {
      await User.findByIdAndUpdate(winnerId, { role: election.type });
    }
  }
};

// Toggle voting phase
export const toggleVotingPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await ElectionConfig.findById(id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election configuration not found",
      });
    }

    // Cannot open voting if application is open
    if (!election.votingPhase.isOpen && election.applicationPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Cannot start voting while application phase is open",
      });
    }

    // Need candidates to open voting
    if (
      !election.votingPhase.isOpen &&
      election.votingPhase.candidates.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot start voting without candidates",
      });
    }

    // Toggle state and record timestamp
    const isOpening = !election.votingPhase.isOpen;
    election.votingPhase.isOpen = isOpening;
    election.votingPhase[isOpening ? "openedAt" : "closedAt"] = new Date();

    await election.save();

    // Calculate results when closing voting
    if (!isOpening) {
      await calculateResults(id);
    }

    return res.status(200).json({
      success: true,
      message: `Voting phase ${isOpening ? "opened" : "closed"} successfully`,
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle voting phase",
      error: error.message,
    });
  }
};

// Get all applications for an election
export const getApplications = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const applications = await Application.find({
      position: election.type,
      targetId: election.targetId,
    }).populate(
      "user",
      "name email branch year rollNumber profilePicture room phoneNumber"
    );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// STUDENT CONTROLLERS

// Get available elections for a student
export const getAvailableElections = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Use a single query with proper indexing
    const elections = await ElectionConfig.find({
      $or: [
        { targetId: user.hostel, type: "hostelManager" },
        { targetId: user.mess, type: "messManager" },
      ],
      $or: [
        { "applicationPhase.isOpen": true },
        { "votingPhase.isOpen": true },
        { "result.winnerId": { $exists: true } },
      ],
    }).populate("targetId");

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available elections",
      error: error.message,
    });
  }
};

// Submit an application
export const submitApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { electionId, answers } = req.body;

    // Use Promise.all for parallel queries
    const [user, election, existingApplication] = await Promise.all([
      User.findById(userId),
      ElectionConfig.findById(electionId),
      Application.findOne({
        user: userId,
        position: election?.type,
        targetId: election?.targetId,
      }),
    ]);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if application phase is open
    if (!election.applicationPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Application phase is not open",
      });
    }

    // Check if user belongs to the target hostel/mess
    const userTargetId =
      election.type === "hostelManager" ? user.hostel : user.mess;
    if (userTargetId.toString() !== election.targetId.toString()) {
      return res.status(403).json({
        success: false,
        message: `You can only apply for your own ${election.type === "hostelManager" ? "hostel" : "mess"}`,
      });
    }

    // Check if user already applied
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this position",
      });
    }

    // Format answers
    const formattedAnswers = election.applicationPhase.questions.map(
      (question, index) => ({
        question,
        answer: answers[index] || "",
      })
    );

    // Create and save application
    const application = await Application.create({
      user: userId,
      position: election.type,
      targetId: election.targetId,
      answers: formattedAnswers,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

// Get candidates for voting
export const getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId)
      .populate({
        path: "votingPhase.candidates.userId",
        select: "name email branch year",
      })
      .populate({
        path: "votingPhase.candidates.applicationId",
      });

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: election.votingPhase.candidates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
};

// Cast a vote
export const castVote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { electionId, candidateId } = req.body;

    // Get election data and check for existing vote in parallel
    const [election, existingVote] = await Promise.all([
      ElectionConfig.findById(electionId),
      Vote.findOne({ election: electionId, voter: userId }),
    ]);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if voting phase is open
    if (!election.votingPhase.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Voting is not open",
      });
    }

    // Check if candidateId is valid
    const isValidCandidate = election.votingPhase.candidates.some(
      (candidate) => candidate.userId.toString() === candidateId
    );

    if (!isValidCandidate) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    // Check if user already voted
    if (existingVote) {
      return res.status(250).json({
        success: false,
        message: "You have already cast your vote for this election",
        castAlready: true,
      });
    }

    // Create vote
    await Vote.create({
      election: electionId,
      voter: userId,
      candidate: candidateId,
    });

    return res.status(201).json({
      success: true,
      message: "Vote cast successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cast vote",
      error: error.message,
    });
  }
};

// Get election results
export const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await ElectionConfig.findById(electionId).populate(
      "result.winnerId",
      "name email branch year"
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    // Check if results are announced (voting closed)
    if (!election.result.winnerId) {
      return res.status(400).json({
        success: false,
        message: "Results not yet announced",
      });
    }

    // Get vote counts for all candidates using aggregation
    const voteCounts = await Vote.aggregate([
      { $match: { election: new mongoose.Types.ObjectId(electionId) } },
      { $group: { _id: "$candidate", count: { $sum: 1 } } },
    ]);

    // Create a map for quick lookup
    const voteCountMap = Object.fromEntries(
      voteCounts.map((item) => [item._id.toString(), item.count])
    );

    // Get all candidate user details
    const candidateIds = election.votingPhase.candidates.map((c) => c.userId);
    const candidateUsers = await User.find(
      { _id: { $in: candidateIds } },
      "name email branch year"
    ).lean();

    // Map user details to candidate IDs
    const userMap = Object.fromEntries(
      candidateUsers.map((user) => [user._id.toString(), user])
    );

    // Build results
    const results = election.votingPhase.candidates.map((candidate) => {
      const candidateId = candidate.userId.toString();
      return {
        candidate: userMap[candidateId],
        voteCount: voteCountMap[candidateId] || 0,
        isWinner: election.result.winnerId.toString() === candidateId,
      };
    });

    // Sort by vote count in descending order
    results.sort((a, b) => b.voteCount - a.voteCount);

    return res.status(200).json({
      success: true,
      announcedAt: election.result.announcedAt,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election results",
      error: error.message,
    });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Get election, college, and target name in parallel
    const [election, college] = await Promise.all([
      ElectionConfig.findById(electionId)
        .populate("result.winnerId", "name email branch year")
        .lean(),
      College.findById(election?.college).select("name"),
    ]);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      });
    }

    const name = await getTargetName(election.targetId);

    // Add name fields
    election.name = name;
    election.collegeName = college.name;

    return res.status(200).json({
      success: true,
      data: election,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch election",
      error: error.message,
    });
  }
};

export const votedOrNot = async (req, res) => {
  try {
    const { electionId } = req.params;
    const voterId = req.user._id;

    const vote = await Vote.findOne({ election: electionId, voter: voterId });

    if (vote) {
      return res.status(250).json({
        success: true,
        hasVoted: true,
        data: vote,
      });
    } else {
      return res.status(200).json({
        success: false,
        hasVoted: false,
        message: "No vote found for the given voter and election.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check vote status",
      error: error.message,
    });
  }
};

export const getStudentElections = async (req, res) => {
  try {
    const { mess: messId, hostel: hostelId } = req.user;

    if (!messId && !hostelId) {
      return res.status(400).json({
        success: false,
        message: "User is not assigned to any mess or hostel",
      });
    }

    // Build conditions based on user's assigned mess and hostel
    const typeConditions = [];
    if (messId) typeConditions.push({ type: "messManager", targetId: messId });
    if (hostelId)
      typeConditions.push({ type: "hostelManager", targetId: hostelId });

    // Combined query
    const elections = await ElectionConfig.find({
      $and: [
        { $or: typeConditions },
        {
          $or: [
            { "applicationPhase.isOpen": true },
            { "votingPhase.isOpen": true },
            { "result.winnerId": { $exists: true } },
          ],
        },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Batch process target names
    const targetIds = [...new Set(elections.map((e) => e.targetId.toString()))];

    // Get all hostel names
    const hostels = await Hostel.find(
      { _id: { $in: targetIds } },
      { _id: 1, name: 1 }
    ).lean();

    // Get all mess names
    const messes = await Mess.find(
      { _id: { $in: targetIds } },
      { _id: 1, name: 1 }
    ).lean();

    // Create lookup map
    const nameMap = {};
    [...hostels, ...messes].forEach((item) => {
      nameMap[item._id.toString()] = item.name;
    });

    // Add names to elections
    for (let election of elections) {
      election.name = nameMap[election.targetId.toString()] || null;
    }

    return res.status(200).json({
      success: true,
      data: elections,
    });
  } catch (error) {
    console.error("Error fetching student elections:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
