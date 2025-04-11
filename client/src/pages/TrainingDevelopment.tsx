import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardFooter,
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Play, 
  File, 
  Clock, 
  ExternalLink,
  CheckCircle2, 
  BookText, 
  BriefcaseBusiness, 
  MessageSquare, 
  AlertTriangle, 
  BrainCircuit, 
  Users, 
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function TrainingDevelopment() {
  const [activeCategory, setActiveCategory] = useState("leadership");

  // Define the structure for the training content
  interface Resource {
    type: "article" | "video";
    title: string;
    source: string;
    url: string;
    icon: JSX.Element;
    description?: string;
    duration?: string;
  }

  interface Module {
    title: string;
    description: string;
    resources: Resource[];
    keyPoints?: string[];
    icon: JSX.Element;
  }

  interface Category {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    modules: Module[];
    color: string;
    background: string;
  }

  // Training data
  const trainingData: Category[] = [
    {
      id: "leadership",
      title: "Leadership Skills",
      description: "Enhance your leadership capabilities through trust-building and leading by example.",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      color: "blue",
      background: "from-blue-500 to-indigo-600",
      modules: [
        {
          title: "Building Trust and Credibility",
          description: "Learn how to establish trust as a leader and build lasting credibility with your team.",
          icon: <BookText className="h-4 w-4" />,
          keyPoints: [
            "Understand the elements of trust in leadership",
            "Develop transparency in communication",
            "Build credibility through consistent actions"
          ],
          resources: [
            {
              type: "article",
              title: "The Neuroscience of Trust",
              source: "Harvard Business Review",
              url: "https://hbr.org/2017/01/the-neuroscience-of-trust",
              icon: <File className="h-4 w-4" />,
              duration: "15 min read",
              description: "Discover the science behind trust in organizations and how to create a high-trust culture that improves performance."
            },
            {
              type: "video",
              title: "How Great Leaders Build Trust",
              source: "TED",
              url: "https://www.youtube.com/watch?v=pVeq-0dIqpk",
              icon: <Play className="h-4 w-4" />,
              duration: "8 min watch",
              description: "Simon Sinek explains how consistency in actions builds trust among team members."
            },
            {
              type: "article",
              title: "Trust and Leadership",
              source: "Center for Creative Leadership",
              url: "https://www.ccl.org/articles/leading-effectively-articles/trust-in-leadership/",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "Learn how trust impacts leadership effectiveness and strategies to build it with your team."
            }
          ]
        },
        {
          title: "Leading by Example",
          description: "Discover strategies to model the behavior and values you want to see in your team.",
          icon: <CheckCircle2 className="h-4 w-4" />,
          keyPoints: [
            "Model the behavior you expect from others",
            "Align your actions with your stated values",
            "Demonstrate work ethic and commitment"
          ],
          resources: [
            {
              type: "article",
              title: "Leaders: The Importance of Leading by Example",
              source: "Forbes",
              url: "https://www.forbes.com/sites/scottedinger/2014/11/12/leaders-the-importance-of-leading-by-example/",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "Understand why your actions as a leader speak louder than words and how to effectively model desired behaviors."
            },
            {
              type: "video",
              title: "Lead by Example",
              source: "Simon Sinek",
              url: "https://www.youtube.com/watch?v=Y9ZgJzeB3Fc",
              icon: <Play className="h-4 w-4" />,
              duration: "10 min watch",
              description: "Learn practical ways to demonstrate leadership through your daily actions."
            },
            {
              type: "article",
              title: "Leading by Example: How the Best Leaders Do It",
              source: "BetterUp",
              url: "https://www.betterup.com/blog/leading-by-example",
              icon: <File className="h-4 w-4" />,
              duration: "14 min read",
              description: "Explore how successful leaders embody values and create a culture of accountability through their actions."
            }
          ]
        },
        {
          title: "Visionary Leadership",
          description: "Learn to create and communicate a compelling vision that inspires your team.",
          icon: <Lightbulb className="h-4 w-4" />,
          keyPoints: [
            "Craft a clear and inspiring vision",
            "Connect organizational goals with personal meaning",
            "Communicate vision effectively across different audiences"
          ],
          resources: [
            {
              type: "article",
              title: "To Be a Great Leader, You Need to Start by Leading Yourself",
              source: "Harvard Business Review",
              url: "https://hbr.org/2022/09/to-be-a-great-leader-you-need-to-start-by-leading-yourself",
              icon: <File className="h-4 w-4" />,
              duration: "16 min read",
              description: "Learn why self-leadership is the foundation of effectively leading others."
            },
            {
              type: "video",
              title: "How to Be a Leader - The 7 Great Leadership Traits",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=aPwXeg8ThWI",
              icon: <Play className="h-4 w-4" />,
              duration: "17 min watch",
              description: "Brian Tracy explains the seven essential qualities that make a great leader."
            },
            {
              type: "article",
              title: "Leadership Vision: The Secret to Leadership Success",
              source: "Inc.com",
              url: "https://www.inc.com/peter-economy/7-secrets-of-visionary-leaders.html",
              icon: <File className="h-4 w-4" />,
              duration: "10 min read",
              description: "Discover how to develop and articulate a vision that drives organizational success."
            }
          ]
        }
      ]
    },
    {
      id: "communication",
      title: "Communication Techniques",
      description: "Master effective communication strategies for clear messaging and powerful feedback.",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "green",
      background: "from-emerald-500 to-green-600",
      modules: [
        {
          title: "Effective Communication for Managers",
          description: "Master the art of clear, purposeful communication that inspires and directs your team.",
          icon: <MessageSquare className="h-4 w-4" />,
          keyPoints: [
            "Adapt communication style to different audiences",
            "Structure messages for maximum clarity",
            "Use active listening techniques"
          ],
          resources: [
            {
              type: "article",
              title: "8 Must-Have Communication Skills for Managers",
              source: "Management Study Guide",
              url: "https://www.managementstudyguide.com/communication-skills-for-managers.htm",
              icon: <File className="h-4 w-4" />,
              duration: "18 min read",
              description: "Detailed guide on developing effective communication skills as a manager."
            },
            {
              type: "video",
              title: "How Leaders Communicate Effectively",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=Jd1sjYdQg3g",
              icon: <Play className="h-4 w-4" />,
              duration: "14 min watch",
              description: "Practical communication techniques from experienced leaders."
            },
            {
              type: "article",
              title: "Leadership Communication: How to Build Trust Through Communication",
              source: "CCL",
              url: "https://www.ccl.org/articles/leading-effectively-articles/the-power-of-positive-leadership-communication/",
              icon: <File className="h-4 w-4" />,
              duration: "13 min read",
              description: "Learn how communication builds trust and drives effective leadership."
            }
          ]
        },
        {
          title: "Giving & Receiving Feedback",
          description: "Learn techniques to deliver impactful feedback and gracefully receive constructive criticism.",
          icon: <ArrowRight className="h-4 w-4" />,
          keyPoints: [
            "Use the SBI (Situation-Behavior-Impact) feedback model",
            "Frame feedback as an opportunity for growth",
            "Receive feedback without defensiveness"
          ],
          resources: [
            {
              type: "article",
              title: "The Art of Giving and Receiving Feedback",
              source: "Mind Tools",
              url: "https://www.mindtools.com/ajdw3co/giving-and-receiving-feedback",
              icon: <File className="h-4 w-4" />,
              duration: "20 min read",
              description: "A comprehensive guide to effective feedback mechanisms in professional environments."
            },
            {
              type: "video",
              title: "The Secret to Giving Great Feedback",
              source: "TED",
              url: "https://www.youtube.com/watch?v=wtl5UrrgU8c",
              icon: <Play className="h-4 w-4" />,
              duration: "11 min watch",
              description: "Learn the structure of effective feedback conversations that drive growth and improvement."
            },
            {
              type: "article",
              title: "How to Give and Receive Feedback Effectively",
              source: "Harvard Business Review",
              url: "https://hbr.org/2021/06/the-right-way-to-process-feedback",
              icon: <File className="h-4 w-4" />,
              duration: "15 min read",
              description: "Strategies for processing feedback constructively and using it for professional development."
            }
          ]
        },
        {
          title: "Persuasive Communication",
          description: "Develop skills to influence others and effectively communicate ideas.",
          icon: <BrainCircuit className="h-4 w-4" />,
          keyPoints: [
            "Structure arguments for maximum impact",
            "Use storytelling to connect emotionally",
            "Adapt persuasion techniques to different contexts"
          ],
          resources: [
            {
              type: "article",
              title: "The Science of Persuasion",
              source: "Harvard Business Review",
              url: "https://hbr.org/2001/10/harnessing-the-science-of-persuasion",
              icon: <File className="h-4 w-4" />,
              duration: "16 min read",
              description: "Learn the six universal principles of persuasion that drive human behavior."
            },
            {
              type: "video",
              title: "How to Speak So That People Want to Listen",
              source: "TED",
              url: "https://www.youtube.com/watch?v=eIho2S0ZahI",
              icon: <Play className="h-4 w-4" />,
              duration: "10 min watch",
              description: "Julian Treasure demonstrates the how-to's of powerful speaking that captivates listeners."
            },
            {
              type: "article",
              title: "The Power of Strategic Storytelling",
              source: "Stanford Business",
              url: "https://www.gsb.stanford.edu/insights/power-strategic-storytelling",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "Discover how strategic storytelling can transform your leadership communication."
            }
          ]
        }
      ]
    },
    {
      id: "conflict",
      title: "Conflict Resolution",
      description: "Develop skills to navigate and resolve conflicts in a professional environment.",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "amber",
      background: "from-amber-500 to-yellow-600",
      modules: [
        {
          title: "Managing Difficult Conversations",
          description: "Learn strategies for approaching challenging discussions with confidence and empathy.",
          icon: <AlertTriangle className="h-4 w-4" />,
          keyPoints: [
            "Prepare for difficult conversations with a clear objective",
            "Manage emotions during tense interactions",
            "Use the COIN (Context, Observation, Impact, Next steps) method"
          ],
          resources: [
            {
              type: "article",
              title: "How to Have Difficult Conversations at Work",
              source: "Harvard Business Review",
              url: "https://hbr.org/2016/07/how-to-have-difficult-conversations-when-you-dont-like-conflict",
              icon: <File className="h-4 w-4" />,
              duration: "15 min read",
              description: "A comprehensive guide to preparing for and executing difficult workplace conversations."
            },
            {
              type: "video",
              title: "Conflict Resolution Techniques",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=KY5TWVz5ZDU",
              icon: <Play className="h-4 w-4" />,
              duration: "12 min watch",
              description: "Learn practical techniques for resolving workplace conflicts effectively."
            },
            {
              type: "article",
              title: "Difficult Conversations: 9 Common Mistakes",
              source: "MindTools",
              url: "https://www.mindtools.com/anu3h8g/difficult-conversations",
              icon: <File className="h-4 w-4" />,
              duration: "13 min read",
              description: "Identify common mistakes in difficult conversations and strategies to avoid them."
            }
          ]
        },
        {
          title: "De-escalation Techniques",
          description: "Master methods to calm tense situations and guide productive resolutions.",
          icon: <Lightbulb className="h-4 w-4" />,
          keyPoints: [
            "Recognize early signs of escalating conflict",
            "Use calming language and non-verbal cues",
            "Create space for reflection and perspective-taking"
          ],
          resources: [
            {
              type: "article",
              title: "How to Manage Workplace Conflict",
              source: "SHRM",
              url: "https://www.shrm.org/resourcesandtools/tools-and-samples/how-to-guides/pages/how-to-manage-workplace-conflict.aspx",
              icon: <File className="h-4 w-4" />,
              duration: "14 min read",
              description: "Practical strategies from HR professionals on managing workplace conflicts."
            },
            {
              type: "video",
              title: "How to De-escalate Conflict",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=C3NGvJiVfE8",
              icon: <Play className="h-4 w-4" />,
              duration: "9 min watch",
              description: "Expert techniques for calming tense situations and finding resolution."
            },
            {
              type: "article",
              title: "The Art of De-escalation in Leadership",
              source: "Forbes",
              url: "https://www.forbes.com/sites/davidtao/2021/02/01/the-art-of-de-escalation-how-to-manage-workplace-conflict-in-a-crisis/",
              icon: <File className="h-4 w-4" />,
              duration: "11 min read",
              description: "Learn strategies for de-escalating workplace conflicts during high-pressure situations."
            }
          ]
        },
        {
          title: "Mediation Skills",
          description: "Develop skills to help others resolve conflicts and reach mutually beneficial solutions.",
          icon: <Users className="h-4 w-4" />,
          keyPoints: [
            "Create a neutral environment for conflict resolution",
            "Facilitate productive dialogue between parties",
            "Guide conflicting parties toward collaborative solutions"
          ],
          resources: [
            {
              type: "article",
              title: "Workplace Mediation Techniques",
              source: "ACAS",
              url: "https://www.acas.org.uk/mediation",
              icon: <File className="h-4 w-4" />,
              duration: "18 min read",
              description: "Professional mediation techniques for resolving workplace disputes."
            },
            {
              type: "video",
              title: "Workplace Mediation Skills",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=MFJDzALSJQs",
              icon: <Play className="h-4 w-4" />,
              duration: "15 min watch",
              description: "Learn mediation techniques to help resolve conflicts between team members."
            },
            {
              type: "article",
              title: "7 Steps for Effective Problem Solving in the Workplace",
              source: "Indeed",
              url: "https://www.indeed.com/career-advice/career-development/problem-solving-in-workplace",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "A structured approach to problem-solving that can be applied to conflict resolution."
            }
          ]
        }
      ]
    },
    {
      id: "decision",
      title: "Decision Making",
      description: "Strengthen your ability to make sound, ethical decisions as a leader.",
      icon: <BrainCircuit className="h-5 w-5" />,
      color: "purple",
      background: "from-purple-500 to-violet-600",
      modules: [
        {
          title: "Strategic Decision-Making",
          description: "Develop frameworks for making decisions that align with organizational goals and values.",
          icon: <BrainCircuit className="h-4 w-4" />,
          keyPoints: [
            "Apply the WRAP decision-making framework",
            "Balance data-driven and intuitive approaches",
            "Consider long-term implications of decisions"
          ],
          resources: [
            {
              type: "article",
              title: "Decision-Making: How to Make Better Decisions",
              source: "Mind Tools",
              url: "https://www.mindtools.com/ahbo0dw/how-to-make-decisions",
              icon: <File className="h-4 w-4" />,
              duration: "16 min read",
              description: "Learn structured approaches to better decision-making in leadership roles."
            },
            {
              type: "video",
              title: "How to Make Better Decisions",
              source: "TED",
              url: "https://www.youtube.com/watch?v=8V2sX9BhAW8",
              icon: <Play className="h-4 w-4" />,
              duration: "13 min watch",
              description: "Discover cognitive biases that affect decisions and how to overcome them."
            },
            {
              type: "article",
              title: "The WRAP Method for Better Decision Making",
              source: "Psychology Today",
              url: "https://www.psychologytoday.com/us/blog/decisions-and-the-teen-brain/201506/the-wrap-method-better-decision-making",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "A practical framework for making better decisions in complex situations."
            }
          ]
        },
        {
          title: "Ethical Leadership",
          description: "Explore how to lead with integrity and make decisions that reflect your values.",
          icon: <BookText className="h-4 w-4" />,
          keyPoints: [
            "Apply ethical frameworks to decision-making",
            "Build an organizational culture of integrity",
            "Navigate ethical dilemmas with confidence"
          ],
          resources: [
            {
              type: "article",
              title: "Why Ethical Leadership Matters",
              source: "Harvard Business Review",
              url: "https://hbr.org/2018/01/how-to-strengthen-your-reputation-as-an-employer",
              icon: <File className="h-4 w-4" />,
              duration: "18 min read",
              description: "Understand the business case for ethical leadership and how to implement it."
            },
            {
              type: "video",
              title: "Ethical Leadership Explained",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=Ei0cROcUOBU",
              icon: <Play className="h-4 w-4" />,
              duration: "15 min watch",
              description: "Thorough explanation of ethical leadership principles with real-world examples."
            },
            {
              type: "article",
              title: "Building an Ethical Culture",
              source: "SHRM",
              url: "https://www.shrm.org/resourcesandtools/tools-and-samples/toolkits/pages/sustainingaethicalculture.aspx",
              icon: <File className="h-4 w-4" />,
              duration: "17 min read",
              description: "Practical steps for developing an ethical organizational culture."
            }
          ]
        },
        {
          title: "Decision-Making Under Pressure",
          description: "Master techniques for making sound decisions in high-stakes situations.",
          icon: <AlertTriangle className="h-4 w-4" />,
          keyPoints: [
            "Maintain clarity during stressful situations",
            "Use structured decision frameworks for high-pressure scenarios",
            "Balance speed and quality in urgent decisions"
          ],
          resources: [
            {
              type: "article",
              title: "Making Decisions Under Pressure",
              source: "McKinsey",
              url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/decision-making-in-uncertain-times",
              icon: <File className="h-4 w-4" />,
              duration: "19 min read",
              description: "Strategic frameworks for decision-making during uncertain times."
            },
            {
              type: "video",
              title: "How to Make Hard Choices",
              source: "TED",
              url: "https://www.youtube.com/watch?v=8GQZuzIdeQQ",
              icon: <Play className="h-4 w-4" />,
              duration: "15 min watch",
              description: "A philosophical approach to making difficult decisions with clarity."
            },
            {
              type: "article",
              title: "Decision Making in a Crisis",
              source: "Center for Creative Leadership",
              url: "https://www.ccl.org/articles/leading-effectively-articles/decision-making-crisis-challenges-solutions/",
              icon: <File className="h-4 w-4" />,
              duration: "14 min read",
              description: "Strategies for effective decision-making during crisis situations."
            }
          ]
        }
      ]
    },
    {
      id: "team",
      title: "Team Building",
      description: "Learn strategies to build, motivate, and empower high-performing teams.",
      icon: <Users className="h-5 w-5" />,
      color: "red",
      background: "from-red-500 to-rose-600",
      modules: [
        {
          title: "Motivating Your Team",
          description: "Discover effective ways to inspire and energize your team members.",
          icon: <Users className="h-4 w-4" />,
          keyPoints: [
            "Understand individual and team motivational factors",
            "Create meaningful recognition practices",
            "Connect team efforts to organizational purpose"
          ],
          resources: [
            {
              type: "article",
              title: "What Motivates Employees to Go Above and Beyond",
              source: "Harvard Business Review",
              url: "https://hbr.org/2017/09/what-motivates-employees-to-go-above-and-beyond",
              icon: <File className="h-4 w-4" />,
              duration: "13 min read",
              description: "Research-backed insights on what truly motivates employees to excel."
            },
            {
              type: "video",
              title: "How to Build a Motivated Team",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=7FeqCiBI_QE",
              icon: <Play className="h-4 w-4" />,
              duration: "10 min watch",
              description: "Practical motivational techniques that create lasting engagement."
            },
            {
              type: "article",
              title: "The Power of Recognition in the Workplace",
              source: "Forbes",
              url: "https://www.forbes.com/sites/forbescoachescouncil/2021/03/03/the-power-of-recognition-in-the-workplace/",
              icon: <File className="h-4 w-4" />,
              duration: "11 min read",
              description: "Strategies for implementing effective recognition programs that boost team morale."
            }
          ]
        },
        {
          title: "Delegation & Trust",
          description: "Learn the art of effective delegation and building trust within your team.",
          icon: <ArrowRight className="h-4 w-4" />,
          keyPoints: [
            "Match tasks to team member strengths",
            "Delegate authority along with responsibility",
            "Provide support without micromanaging"
          ],
          resources: [
            {
              type: "article",
              title: "How to Delegate Well",
              source: "Harvard Business Review",
              url: "https://hbr.org/2017/10/to-be-a-great-leader-you-have-to-learn-how-to-delegate-well",
              icon: <File className="h-4 w-4" />,
              duration: "14 min read",
              description: "Learn the delegation practices of exceptional leaders that build team capacity."
            },
            {
              type: "video",
              title: "The Art of Effective Delegation",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=IuzjIBRZjto",
              icon: <Play className="h-4 w-4" />,
              duration: "9 min watch",
              description: "Effective delegation strategies that empower your team and free up your time."
            },
            {
              type: "article",
              title: "Delegation: The Art of Letting Go",
              source: "Mind Tools",
              url: "https://www.mindtools.com/a78l6yo/delegation",
              icon: <File className="h-4 w-4" />,
              duration: "15 min read",
              description: "A comprehensive guide to mastering the art of delegation for leaders."
            }
          ]
        },
        {
          title: "Building High-Performance Teams",
          description: "Learn strategies to develop cohesive, innovative, and results-oriented teams.",
          icon: <CheckCircle2 className="h-4 w-4" />,
          keyPoints: [
            "Define clear team goals and success metrics",
            "Foster psychological safety and open communication",
            "Develop team norms that drive high performance"
          ],
          resources: [
            {
              type: "article",
              title: "What Google Learned From Its Quest to Build the Perfect Team",
              source: "New York Times",
              url: "https://www.nytimes.com/2016/02/28/magazine/what-google-learned-from-its-quest-to-build-the-perfect-team.html",
              icon: <File className="h-4 w-4" />,
              duration: "20 min read",
              description: "Google's groundbreaking research on what makes teams effective."
            },
            {
              type: "video",
              title: "How to Turn a Group of Strangers into a Team",
              source: "TED",
              url: "https://www.youtube.com/watch?v=3boKz0Exros",
              icon: <Play className="h-4 w-4" />,
              duration: "13 min watch",
              description: "Amy Edmondson explains how to build teams that work together effectively."
            },
            {
              type: "article",
              title: "The Secrets of Great Teamwork",
              source: "Harvard Business Review",
              url: "https://hbr.org/2016/06/the-secrets-of-great-teamwork",
              icon: <File className="h-4 w-4" />,
              duration: "16 min read",
              description: "Research-based approach to creating high-performing teams in any context."
            }
          ]
        }
      ]
    }
  ];

  // Get current category data based on active tab
  const currentCategory = trainingData.find(category => category.id === activeCategory) || trainingData[0];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent mb-4">
          Training & Development Resources
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Enhance your leadership, management, and instructional coaching abilities with our 
          curated professional development resources. Browse materials by topic to strengthen 
          your skills and support continuous learning across all campuses.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {trainingData.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={`gap-2 rounded-full px-4 py-2 ${
              activeCategory === category.id ? `bg-${category.color}-600 hover:bg-${category.color}-700` : ''
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              activeCategory === category.id ? 'text-white' : `text-${category.color}-600`
            }`}>
              {category.icon}
            </div>
            <span>{category.title}</span>
          </Button>
        ))}
      </div>

      {/* Category header */}
      <div className="mb-8">
        <div className={`p-6 rounded-lg bg-gradient-to-r ${currentCategory.background} text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {currentCategory.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentCategory.title}</h2>
              <p className="text-white/80">{currentCategory.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Why This Matters</h3>
              <p className="text-white/80 text-sm">
                These skills are essential for creating a positive work environment, building strong teams, 
                and achieving organizational goals through effective leadership.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">How To Use These Resources</h3>
              <p className="text-white/80 text-sm">
                Browse the modules below and explore resources that address your specific needs. 
                Bookmark articles and videos for future reference.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules accordion */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Learning Modules</h3>
        <Accordion type="single" collapsible className="w-full">
          {currentCategory.modules.map((module, index) => (
            <AccordionItem key={index} value={`module-${index}`} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 [&>svg]:shrink-0">
                <div className="flex items-center text-left">
                  <div className={`mr-4 h-10 w-10 rounded-full bg-${currentCategory.color}-100 text-${currentCategory.color}-600 flex items-center justify-center`}>
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.resources.length} resources available</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-gray-50 border-t border-gray-200">
                <div className="p-6">
                  <p className="text-gray-700 mb-6">{module.description}</p>
                  
                  {module.keyPoints && (
                    <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Key Takeaways</h4>
                      <ul className="space-y-2">
                        {module.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <h4 className="font-medium text-gray-900 mb-4">Resources</h4>
                  <div className="space-y-4">
                    {module.resources.map((resource, resourceIndex) => (
                      <Card key={resourceIndex} className="overflow-hidden border border-gray-200">
                        <div className="p-0">
                          <div className={`h-2 bg-${resource.type === 'article' ? 'blue' : 'red'}-500 w-full`}></div>
                          <div className="p-5">
                            <div className="flex items-start">
                              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 ${
                                resource.type === 'article' 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'bg-red-50 text-red-600'
                              }`}>
                                {resource.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{resource.title}</h4>
                                  <Badge variant="outline" className={
                                    resource.type === 'article' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }>
                                    {resource.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Source: {resource.source}</p>
                                
                                {resource.duration && (
                                  <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    <span>{resource.duration}</span>
                                  </div>
                                )}
                                
                                {resource.description && (
                                  <p className="mt-3 text-gray-700">{resource.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <Button asChild variant="outline" size="sm" className="gap-1.5">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <span>View Resource</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Related categories */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-4">Related Skill Areas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainingData
            .filter(category => category.id !== activeCategory)
            .slice(0, 3)
            .map((category) => (
              <Card 
                key={category.id}
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => setActiveCategory(category.id)}
              >
                <CardHeader className={`py-4 bg-gradient-to-r ${category.background} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      {category.icon}
                    </div>
                    <Badge variant="outline" className="bg-white/20 text-white border-transparent">
                      {category.modules.length} modules
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 font-semibold text-white">{category.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="w-full gap-1">
                    <span>Explore Resources</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  );
}