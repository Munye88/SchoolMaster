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
            "Understand the 3 elements of trust in leadership",
            "Develop transparency in communication",
            "Build credibility through consistent actions"
          ],
          resources: [
            {
              type: "article",
              title: "The 3 Elements of Trust",
              source: "Harvard Business Review",
              url: "https://hbr.org/2019/05/the-3-elements-of-trust",
              icon: <File className="h-4 w-4" />,
              duration: "15 min read",
              description: "Learn about the three elements of trust that leaders must demonstrate: positive relationships, good judgment, and consistency."
            },
            {
              type: "video",
              title: "How Great Leaders Build Trust",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=pVeq-0dIqpk",
              icon: <Play className="h-4 w-4" />,
              duration: "8 min watch",
              description: "Simon Sinek explains how consistency in actions builds trust among team members."
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
              title: "Leadership and Integrity",
              source: "MindTools",
              url: "https://www.mindtools.com/pages/article/integrity.htm",
              icon: <File className="h-4 w-4" />,
              duration: "12 min read",
              description: "Explore how integrity in leadership creates a foundation of trust and respect."
            },
            {
              type: "video",
              title: "Lead by Example",
              source: "Simon Sinek",
              url: "https://www.youtube.com/watch?v=Y9ZgJzeB3Fc",
              icon: <Play className="h-4 w-4" />,
              duration: "10 min watch",
              description: "Learn practical ways to demonstrate leadership through your daily actions."
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
              title: "Communication Skills for Managers",
              source: "Project Management Academy",
              url: "https://projectmanagementacademy.net/resources/blog/communication-skills-for-managers/",
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
              title: "The Feedback Fallacy",
              source: "Harvard Business Review",
              url: "https://hbr.org/2019/03/the-feedback-fallacy",
              icon: <File className="h-4 w-4" />,
              duration: "20 min read",
              description: "Research-based insights on effective feedback mechanisms in organizations."
            },
            {
              type: "video",
              title: "The Secret to Giving Great Feedback",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=wtl5UrrgU8c",
              icon: <Play className="h-4 w-4" />,
              duration: "11 min watch",
              description: "Learn the structure of effective feedback conversations."
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
              title: "How to Have Difficult Conversations",
              source: "Center for Creative Leadership",
              url: "https://www.ccl.org/articles/leading-effectively-articles/how-to-have-difficult-conversations/",
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
              description: "Learn practical techniques for resolving workplace conflicts."
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
              title: "13 Ways to Manage Conflict in the Workplace",
              source: "Forbes",
              url: "https://www.forbes.com/sites/forbescoachescouncil/2018/06/27/13-ways-to-effectively-manage-conflict-in-the-workplace/",
              icon: <File className="h-4 w-4" />,
              duration: "14 min read",
              description: "Practical strategies from executive coaches on managing workplace conflicts."
            },
            {
              type: "video",
              title: "De-escalation Skills",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=G7QJ_g77Xzo",
              icon: <Play className="h-4 w-4" />,
              duration: "9 min watch",
              description: "Expert techniques for calming tense situations and finding resolution."
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
              title: "4 Steps to Improving Your Decision Making",
              source: "Kepner-Tregoe",
              url: "https://www.kepner-tregoe.com/blog/4-steps-to-improving-your-decision-making/",
              icon: <File className="h-4 w-4" />,
              duration: "16 min read",
              description: "Learn the proven Kepner-Tregoe approach to structured decision making."
            },
            {
              type: "video",
              title: "How to Make Better Decisions",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=cIQHtVOqQfA",
              icon: <Play className="h-4 w-4" />,
              duration: "13 min watch",
              description: "Discover cognitive biases that affect decisions and how to overcome them."
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
              title: "Ethical Leadership in Business",
              source: "University of Notre Dame",
              url: "https://www.notredameonline.com/resources/business-administration/ethical-leadership-and-decision-making-in-business/",
              icon: <File className="h-4 w-4" />,
              duration: "18 min read",
              description: "Academic perspective on ethical leadership principles and practices."
            },
            {
              type: "video",
              title: "Ethical Leadership Explained",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=NXhm0GQnxZM",
              icon: <Play className="h-4 w-4" />,
              duration: "15 min watch",
              description: "Thorough explanation of ethical leadership principles with real-world examples."
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
              title: "14 Ways to Boost Team Motivation",
              source: "Forbes",
              url: "https://www.forbes.com/sites/forbescoachescouncil/2018/10/22/14-ways-to-boost-team-motivation/",
              icon: <File className="h-4 w-4" />,
              duration: "13 min read",
              description: "A collection of proven motivation techniques from executive coaches."
            },
            {
              type: "video",
              title: "How to Build a Motivated Team",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=7FeqCiBI_QE",
              icon: <Play className="h-4 w-4" />,
              duration: "10 min watch",
              description: "Practical motivational techniques that create lasting engagement."
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
              title: "Delegation Strategies for Leaders",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=TfswNRIjmqo",
              icon: <Play className="h-4 w-4" />,
              duration: "11 min watch",
              description: "Step-by-step guide to effective delegation that empowers team members."
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