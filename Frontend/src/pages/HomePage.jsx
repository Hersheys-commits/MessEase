import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  CheckCircle,
  Star,
  User,
  Users,
  Coffee,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Logo from "../components/Logo";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const sectionsRef = useRef({});

  // Handle navigation scrolling with enhanced tracking
  useEffect(() => {
    const handleScroll = () => {
      // Update scroll position for animation effects
      setScrollY(window.scrollY);

      const sections = document.querySelectorAll("section");
      let currentActiveSection = "hero";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        // More precise section detection with viewport consideration
        if (
          window.scrollY >= sectionTop - 150 &&
          window.scrollY < sectionTop + sectionHeight - 150
        ) {
          currentActiveSection = section.id;
        }
      });

      setActiveSection(currentActiveSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Intersection Observer for animations
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, options);

    // Observe all section elements and their children with animation classes
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  // Smooth scroll to section with enhanced animation
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  // Handle login/signup
  const handleAuth = (role) => {
    if (role === "student") {
      navigate("/student/login");
    } else {
      navigate("/admin/login");
    }
  };

  // Team members data
  const teamMembers = [
    {
      name: "Meet Korat",
      role: "Lead Developer",
      image: "/src/assets/meet.png",
    },
    {
      name: "Harsh Sharma",
      role: "Frontend Developer",
      image: "/src/assets/harsh.png",
    },
    {
      name: "Manu Bhusan",
      role: "Project Manager",
      image: "/src/assets/manu.png",
    },
  ];

  // FAQ data
  const faqs = [
    {
      question: "What is MessEase and how does it work?",
      answer:
        "MessEase is a comprehensive platform designed to streamline hostel and mess management for students, accountants, professors, and administrative staff. It provides personalized dashboards and features based on user roles.",
    },
    {
      question: "Who can register and manage complaints?",
      answer:
        "Students can register complaints about hostel and mess facilities. Administrative staff can view, process, and resolve these complaints through their dedicated dashboard.",
    },
    {
      question: "How secure is my information?",
      answer:
        "Your data is secured with industry-standard protocols. We implement encryption, secure authentication, and regular security audits to protect all user information.",
    },
    {
      question: "How do I update my mess menu or track expenses?",
      answer:
        "Administrators can update mess menus through the admin dashboard. Expense tracking is available in the analytics section, providing detailed reports and visualizations.",
    },
  ];

  // Features data
  const features = [
    {
      icon: <MessageSquare size={24} className="text-cyan-400" />,
      title: "Complaint Management",
      description: "Register and track complaints in real-time",
    },
    {
      icon: <Coffee size={24} className="text-cyan-400" />,
      title: "Mess Menu Updates",
      description: "View and rate daily mess menus",
    },
    {
      icon: <Calendar size={24} className="text-cyan-400" />,
      title: "Meal Planning",
      description: "Plan and customize your meal schedule",
    },
    {
      icon: <CheckCircle size={24} className="text-cyan-400" />,
      title: "Issue Resolution",
      description: "Quick resolution of hostel-related issues",
    },
  ];

  return (
    <div className="font-sans text-gray-200 bg-gray-900 overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-on-scroll {
          opacity: 0;
        }

        .animate-in {
          animation-duration: 0.8s;
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .fade-in-up {
          animation-name: fadeInUp;
        }

        .fade-in-left {
          animation-name: fadeInLeft;
        }

        .fade-in-right {
          animation-name: fadeInRight;
        }

        .zoom-in {
          animation-name: zoomIn;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        /* Section transition effect */
        section {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* Parallax effects */
        .parallax {
          transform: translateY(var(--parallax-offset));
          transition: transform 0.2s ease-out;
        }
      `}</style>

      {/* Header/Navigation */}
      <header className="fixed w-full bg-gray-900 shadow-lg shadow-cyan-900/20 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo with animation */}
            <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
              <Logo />
            </div>

            {/* Desktop Navigation with hover effects */}
            <nav className="hidden md:flex space-x-8">
              {[
                "hero",
                "about",
                "features",
                "screenshots",
                "faq",
                "team",
                "contact",
              ].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`${
                    activeSection === section
                      ? "text-cyan-400 font-semibold"
                      : "text-gray-300 hover:text-cyan-300"
                  } transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-cyan-400 
                    after:transition-all after:duration-300 ${activeSection === section ? "after:w-full" : "after:w-0"} hover:after:w-full`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button with animation */}
            <button
              className="md:hidden text-gray-300 hover:text-cyan-400 focus:outline-none transition-transform duration-300 active:scale-90"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} className="animate-in fade-in-up" />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation with slide animation */}
        <div
          className={`md:hidden bg-gray-800 py-4 px-4 shadow-inner border-t border-gray-700 transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <nav className="flex flex-col space-y-4">
            {[
              "hero",
              "about",
              "features",
              "screenshots",
              "faq",
              "team",
              "contact",
            ].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`${
                  activeSection === section
                    ? "text-cyan-400 font-semibold"
                    : "text-gray-300"
                } transition-colors duration-300 text-left transform transition-transform ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section with parallax effect */}
      <section
        id="hero"
        className="pt-32 pb-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600 rounded-full opacity-10 blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          ></div>
          <div
            className="absolute top-80 -left-20 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl"
            style={{ transform: `translateY(${scrollY * -0.03}px)` }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-on-scroll animate-in fade-in-left">
                Welcome to <span className="text-cyan-400">MessEase</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-gray-300 mb-6 animate-on-scroll animate-in fade-in-left delay-100">
                Simplifying Hostel & Mess Management
              </h2>
              <p className="text-gray-400 mb-8 text-lg animate-on-scroll animate-in fade-in-left delay-200">
                Effortlessly manage hostel accommodations, mess menus, and daily
                operations with our comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-on-scroll animate-in fade-in-up delay-300">
                <button
                  onClick={() => scrollToSection("about")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-600/20 transform hover:-translate-y-1"
                >
                  Learn More
                </button>
                <button
                  onClick={() => navigate("/student/signup")}
                  className="border border-cyan-500 text-cyan-400 hover:bg-cyan-900/30 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 transform hover:-translate-y-1"
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="md:w-1/2 animate-on-scroll animate-in fade-in-right delay-200">
              <div className="relative transform transition-transform hover:scale-105 duration-700">
                <Logo className="animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login/Signup Section with card hover effects */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700 transform hover:shadow-xl hover:shadow-cyan-900/20 transition-all duration-500 animate-on-scroll animate-in zoom-in">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-white animate-on-scroll animate-in fade-in-up">
                Ready to Get Started?
              </h3>
              <p className="text-center text-gray-400 mb-8 animate-on-scroll animate-in fade-in-up delay-100">
                Select your role to login or create a new account
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700 animate-on-scroll animate-in fade-in-left delay-200">
                  <User size={48} className="mx-auto mb-4 text-cyan-400" />
                  <h4 className="text-xl font-semibold mb-2 text-white">
                    Student
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Access mess menus, register complaints, and rate meals
                  </p>
                  <button
                    onClick={() => handleAuth("student")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 w-full hover:shadow-lg hover:shadow-cyan-600/20"
                  >
                    Student Login
                  </button>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700 animate-on-scroll animate-in fade-in-right delay-200">
                  <Users size={48} className="mx-auto mb-4 text-cyan-400" />
                  <h4 className="text-xl font-semibold mb-2 text-white">
                    Administrator
                  </h4>
                  <p className="text-gray-400 mb-4">
                    Manage hostels, resolve complaints, and update menus
                  </p>
                  <button
                    onClick={() => handleAuth("admin")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 w-full hover:shadow-lg hover:shadow-cyan-600/20"
                  >
                    Admin Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with staggered animations */}
      <section
        id="about"
        className="py-16 bg-gray-900 relative overflow-hidden"
      >
        {/* Animated background element */}
        <div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 800) * 0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              About MessEase
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              A comprehensive platform designed to streamline hostel and mess
              management for students, accountants, professors, and
              administrative staff.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
            <div className="md:w-1/2 mb-8 md:mb-0 animate-on-scroll animate-in fade-in-left">
              <Logo className="transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h3 className="text-2xl font-semibold mb-4 text-white animate-on-scroll animate-in fade-in-right">
                Our Mission
              </h3>
              <p className="text-gray-400 mb-6 animate-on-scroll animate-in fade-in-right delay-100">
                Our mission is to enhance the campus living experience by
                simplifying complaint resolution, daily orders, meal ratings,
                and overall communication between students and staff.
              </p>

              <h3 className="text-2xl font-semibold mb-4 text-white animate-on-scroll animate-in fade-in-right delay-200">
                Key Benefits
              </h3>
              <ul className="space-y-3">
                {[
                  "User-specific dashboards",
                  "Real-time complaint tracking",
                  "Interactive mess menus",
                  "Detailed expense analytics",
                ].map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start animate-on-scroll animate-in fade-in-right"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <CheckCircle
                      className="text-cyan-400 mr-2 mt-1 flex-shrink-0"
                      size={20}
                    />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with hover effects and staggered animations */}
      <section
        id="features"
        className="py-16 bg-gray-800 relative overflow-hidden"
      >
        {/* Animated background element */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 1400) * 0.08}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              Features & How It Works
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              Discover how MessEase simplifies hostel and mess management with
              these powerful features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-6 shadow-md transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700 animate-on-scroll animate-in fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="mb-4 transform transition-all duration-300 hover:scale-110 hover:text-cyan-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-semibold text-center mb-8 text-white animate-on-scroll animate-in fade-in-up">
              How It Works
            </h3>
            <div className="relative">
              {/* Process steps with animated connector */}
              <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-900 to-transparent -translate-y-1/2 z-0 animate-on-scroll animate-in zoom-in"></div>
              <div className="flex flex-col md:flex-row justify-between relative z-10">
                {[
                  {
                    title: "Login/Sign-Up",
                    desc: "Access tailored services based on your role",
                  },
                  {
                    title: "Dashboard",
                    desc: "Manage complaints and view daily updates",
                  },
                  {
                    title: "Interaction",
                    desc: "Update menus, register issues, and more",
                  },
                  {
                    title: "Resolution",
                    desc: "Resolve issues and track progress",
                  },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center mb-8 md:mb-0 animate-on-scroll animate-in fade-in-up"
                    style={{ animationDelay: `${0.2 + index * 0.15}s` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-cyan-600/20 transform transition-transform hover:scale-110 duration-300">
                      {index + 1}
                    </div>
                    <h4 className="text-lg font-semibold mb-2 text-white">
                      {step.title}
                    </h4>
                    <p className="text-gray-400 text-center max-w-xs">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section with hover effects and masonry layout */}
      <section
        id="screenshots"
        className="py-16 bg-gray-900 relative overflow-hidden"
      >
        {/* Animated background element */}
        <div
          className="absolute bottom-0 left-20 w-80 h-80 bg-purple-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 2000) * -0.05}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              Screenshots & Preview
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              Take a peek at the MessEase interface and experience the
              simplicity of our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              "Student Dashboard",
              "Complaint Registration",
              "Mess Menu Updates",
              "Elections Panel",
              "Pay Hostel/Mess Fee",
              "Group Chat",
            ].map((screen, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 animate-on-scroll animate-in fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="overflow-hidden">
                  <img
                    src={`/src/assets/${index + 1}00.png`}
                    alt={screen}
                    className="w-full h-64 object-cover transform transition-transform duration-700 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {screen}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {index === 0 &&
                      "Personalized view with quick access to all features."}
                    {index === 1 &&
                      "Simple form to register and track complaints."}
                    {index === 2 && "Daily mess menu with rating options."}
                    {index === 3 &&
                      "Student Elections for mess representatives."}
                    {index === 4 &&
                      "Pay your hostel or mess fee through the portal and download receipt."}
                    {index === 5 &&
                      "Chat with your hostel mates and participate in active polls."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with accordion animation */}
      <section id="faq" className="py-16 bg-gray-800 relative overflow-hidden">
        {/* Animated background element */}
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 2600) * 0.03}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              Find answers to common questions about MessEase.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-6 border-b border-gray-700 pb-6 last:border-b-0 transform transition-all duration-500 hover:bg-gray-750 hover:shadow-lg rounded-lg p-4 hover:border-gray-600 animate-on-scroll animate-in fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <h3 className="text-xl font-semibold mb-3 text-white flex items-center">
                  <span>{faq.question}</span>
                </h3>
                <p className="text-gray-400 transition-all">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with card animations */}
      <section id="team" className="py-16 bg-gray-900 relative overflow-hidden">
        {/* Animated background element */}
        <div
          className="absolute bottom-10 left-1/4 w-80 h-80 bg-blue-600 rounded-full opacity-5 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 3200) * -0.04}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white animate-on-scroll animate-in fade-in-up">
              Meet Our Team
            </h2>
            <div className="w-16 h-1 bg-cyan-500 mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="text-gray-400 max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              The visionaries behind MessEase who are passionate about improving
              campus living.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg shadow-md p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-cyan-900/20 border border-gray-700 animate-on-scroll animate-in fade-in-up"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                <div className="relative mb-4 mx-auto w-24 h-24 rounded-full overflow-hidden transform transition-all duration-500 hover:scale-110 group">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold mb-1 text-white">
                  {member.name}
                </h3>
                <p className="text-cyan-400 mb-3">{member.role}</p>
                <div className="flex justify-center space-x-3">
                  {/* Social media icons with hover effects */}
                  <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-cyan-700 hover:text-white transform transition-all duration-300 hover:scale-110 cursor-pointer">
                    in
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-cyan-700 hover:text-white transform transition-all duration-300 hover:scale-110 cursor-pointer">
                    f
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-cyan-700 hover:text-white transform transition-all duration-300 hover:scale-110 cursor-pointer">
                    t
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with form animations */}
      <section
        id="contact"
        className="py-16 bg-cyan-900 text-white relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div
          className="absolute top-20 right-10 w-96 h-96 bg-blue-600 rounded-full opacity-10 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 3600) * 0.05}px)` }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-64 h-64 bg-cyan-300 rounded-full opacity-10 blur-3xl"
          style={{ transform: `translateY(${(scrollY - 3600) * -0.03}px)` }}
        ></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-on-scroll animate-in fade-in-up">
              Get In Touch
            </h2>
            <div className="w-16 h-1 bg-white mx-auto mb-6 animate-on-scroll animate-in zoom-in delay-100"></div>
            <p className="max-w-3xl mx-auto animate-on-scroll animate-in fade-in-up delay-200">
              Have questions? We're here to help. Reach out to our team.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700 animate-on-scroll animate-in zoom-in delay-100">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-gray-900 p-8 animate-on-scroll animate-in fade-in-left delay-200">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <p className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                    <span className="mr-2">📧</span> support@messease.com
                  </p>
                  <p className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                    <span className="mr-2">📱</span> +1 (555) 123-4567
                  </p>
                  <p className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                    <span className="mr-2">📍</span> MNNIT Allahabad, Prayagraj,
                    Uttar Pradesh, India – 211004
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
                  <div className="flex space-x-4">
                    {/* Social media icons with hover effects */}
                    <a
                      href="https://www.linkedin.com/in/harsh-sharma-310134298/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30">
                        <span>f</span>
                      </button>
                    </a>
                    <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30">
                      <span>in</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-cyan-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30">
                      <span>t</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-3/5 p-8 text-gray-200 animate-on-scroll animate-in fade-in-right delay-200">
                <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="transform transition-all duration-300 hover:translate-y-1 focus-within:translate-y-1">
                      <label className="block text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all duration-300 focus:bg-gray-600"
                        placeholder="John"
                      />
                    </div>
                    <div className="transform transition-all duration-300 hover:translate-y-1 focus-within:translate-y-1">
                      <label className="block text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all duration-300 focus:bg-gray-600"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:translate-y-1 focus-within:translate-y-1">
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all duration-300 focus:bg-gray-600"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="transform transition-all duration-300 hover:translate-y-1 focus-within:translate-y-1">
                    <label className="block text-gray-300 mb-2">Message</label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all duration-300 focus:bg-gray-600"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-600/30 transform hover:-translate-y-1">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with hover effects */}
      <footer className="bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 animate-on-scroll animate-in fade-in-left">
              <div className="flex items-center space-x-2 transform transition-all duration-500 hover:scale-105">
                <Logo />
              </div>
              <p className="mt-2 text-gray-400">
                Simplifying Hostel & Mess Management
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 animate-on-scroll animate-in fade-in-right">
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <button
                      onClick={() => scrollToSection("about")}
                      className="hover:text-cyan-400 transition-colors transform transition-all duration-300 hover:translate-x-1"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="hover:text-cyan-400 transition-colors transform transition-all duration-300 hover:translate-x-1"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection("contact")}
                      className="hover:text-cyan-400 transition-colors transform transition-all duration-300 hover:translate-x-1"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-white">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transition-colors transform transition-all duration-300 hover:translate-x-1"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transition-colors transform transition-all duration-300 hover:translate-x-1"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} MessEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll indicator */}
      <div
        className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-600/30 cursor-pointer transform hover:scale-110 transition-all duration-300 z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          opacity: scrollY > 300 ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default HomePage;
