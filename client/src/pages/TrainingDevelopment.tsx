import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, File, BookOpen, Award, BriefcaseBusiness, MessageSquare, AlertTriangle, BrainCircuit, Users } from "lucide-react";

export default function TrainingDevelopment() {
  const [activeTab, setActiveTab] = useState("leadership");

  // Define the structure for the training content
  interface Resource {
    type: "article" | "video";
    title: string;
    source: string;
    url: string;
    icon: JSX.Element;
  }

  interface Module {
    title: string;
    description: string;
    resources: Resource[];
    completed?: boolean;
  }

  interface Category {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    modules: Module[];
    progress: number;
  }

  // Training data based on the attachment
  const trainingData: Category[] = [
    {
      id: "leadership",
      title: "Leadership Skills",
      description: "Enhance your leadership capabilities through trust-building and leading by example.",
      icon: <BriefcaseBusiness className="h-5 w-5" />,
      progress: 25,
      modules: [
        {
          title: "Building Trust and Credibility",
          description: "Learn how to establish trust as a leader and build lasting credibility with your team.",
          resources: [
            {
              type: "article",
              title: "It All Starts with Trust",
              source: "Harvard Business",
              url: "https://hbr.org/2019/05/the-3-elements-of-trust",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "How Great Leaders Build Trust",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=pVeq-0dIqpk",
              icon: <Play className="h-4 w-4" />
            }
          ]
        },
        {
          title: "Leading by Example",
          description: "Discover strategies to model the behavior and values you want to see in your team.",
          resources: [
            {
              type: "article",
              title: "Leadership and Integrity",
              source: "MindTools",
              url: "https://www.mindtools.com/pages/article/integrity.htm",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "Lead by Example",
              source: "Simon Sinek",
              url: "https://www.youtube.com/watch?v=Y9ZgJzeB3Fc",
              icon: <Play className="h-4 w-4" />
            }
          ]
        }
      ]
    },
    {
      id: "communication",
      title: "Communication Techniques",
      description: "Enhance your ability to communicate effectively and provide constructive feedback.",
      icon: <MessageSquare className="h-5 w-5" />,
      progress: 10,
      modules: [
        {
          title: "Effective Communication for Managers",
          description: "Master the art of clear, purposeful communication that inspires and directs your team.",
          resources: [
            {
              type: "article",
              title: "Effective Communication for Managers",
              source: "PMA",
              url: "https://www.pma.com/content/articles/2020/08/effective-communication-for-managers",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "How Leaders Communicate Effectively",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=Jd1sjYdQg3g",
              icon: <Play className="h-4 w-4" />
            }
          ]
        },
        {
          title: "Giving & Receiving Feedback",
          description: "Learn techniques to deliver impactful feedback and gracefully receive constructive criticism.",
          resources: [
            {
              type: "article",
              title: "Feedback That Works",
              source: "Harvard Business Review",
              url: "https://hbr.org/2019/03/the-feedback-fallacy",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "How to Give Feedback",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=wtl5UrrgU8c",
              icon: <Play className="h-4 w-4" />
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
      progress: 15,
      modules: [
        {
          title: "Managing Difficult Conversations",
          description: "Learn strategies for approaching challenging discussions with confidence and empathy.",
          resources: [
            {
              type: "article",
              title: "Conflict Resolution Training",
              source: "CCL",
              url: "https://www.ccl.org/articles/leading-effectively-articles/how-to-have-difficult-conversations/",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "Conflict Resolution at Work",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=KY5TWVz5ZDU",
              icon: <Play className="h-4 w-4" />
            }
          ]
        },
        {
          title: "De-escalation Techniques",
          description: "Master methods to calm tense situations and guide productive resolutions.",
          resources: [
            {
              type: "article",
              title: "Dealing with Conflict in the Workplace",
              source: "Forbes",
              url: "https://www.forbes.com/sites/forbescoachescouncil/2018/06/27/13-ways-to-effectively-manage-conflict-in-the-workplace/",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "De-escalation Skills",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=G7QJ_g77Xzo",
              icon: <Play className="h-4 w-4" />
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
      progress: 35,
      modules: [
        {
          title: "Strategic Decision-Making",
          description: "Develop frameworks for making decisions that align with organizational goals and values.",
          resources: [
            {
              type: "article",
              title: "Decision Making for Leaders",
              source: "Kepner-Tregoe",
              url: "https://www.kepner-tregoe.com/blog/4-steps-to-improving-your-decision-making/",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "Making Better Decisions",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=cIQHtVOqQfA",
              icon: <Play className="h-4 w-4" />
            }
          ]
        },
        {
          title: "Ethical Leadership",
          description: "Explore how to lead with integrity and make decisions that reflect your values.",
          resources: [
            {
              type: "article",
              title: "Ethical Decision-Making in Leadership",
              source: "University of Notre Dame",
              url: "https://www.notredameonline.com/resources/business-administration/ethical-leadership-and-decision-making-in-business/",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "Ethical Leadership Explained",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=NXhm0GQnxZM",
              icon: <Play className="h-4 w-4" />
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
      progress: 20,
      modules: [
        {
          title: "Motivating Your Team",
          description: "Discover effective ways to inspire and energize your team members.",
          resources: [
            {
              type: "article",
              title: "14 Ways to Boost Teamwork",
              source: "Forbes",
              url: "https://www.forbes.com/sites/forbescoachescouncil/2018/10/22/14-ways-to-boost-team-motivation/",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "How to Build a Motivated Team",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=7FeqCiBI_QE",
              icon: <Play className="h-4 w-4" />
            }
          ]
        },
        {
          title: "Delegation & Trust",
          description: "Learn the art of effective delegation and building trust within your team.",
          resources: [
            {
              type: "article",
              title: "Why Delegation Is Essential",
              source: "Harvard Business Review",
              url: "https://hbr.org/2017/10/to-be-a-great-leader-you-have-to-learn-how-to-delegate-well",
              icon: <File className="h-4 w-4" />
            },
            {
              type: "video",
              title: "Delegation Strategies for Leaders",
              source: "YouTube",
              url: "https://www.youtube.com/watch?v=TfswNRIjmqo",
              icon: <Play className="h-4 w-4" />
            }
          ]
        }
      ]
    },
  ];

  // Get current category data based on active tab
  const activeCategory = trainingData.find(category => category.id === activeTab) || trainingData[0];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent mb-4">
          Training & Development
        </h1>
        <p className="text-gray-600 mb-6 max-w-3xl">
          Enhance your leadership, management, and instructional coaching abilities with our 
          structured professional development resources. Promoting leadership consistency and 
          a culture of continuous learning across all campuses.
        </p>
      </div>

      {/* Category cards in grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {trainingData.map((category) => (
          <Card 
            key={category.id}
            className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
              activeTab === category.id 
                ? 'border-2 border-blue-500 shadow-md' 
                : 'border border-gray-200'
            }`}
            onClick={() => setActiveTab(category.id)}
          >
            <CardHeader className="py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeTab === category.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.icon}
                </div>
                <Badge variant={activeTab === category.id ? "default" : "outline"}>
                  {category.modules.length} modules
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 font-semibold">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1.5 flex justify-between">
                  <span>Completion</span>
                  <span className="font-medium">{category.progress}%</span>
                </div>
                <Progress value={category.progress} className="h-2" />
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active category modules */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              {activeCategory.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{activeCategory.title}</h2>
              <p className="text-gray-600">{activeCategory.description}</p>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {activeCategory.modules.map((module, index) => (
            <AccordionItem key={index} value={`module-${index}`}>
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center text-left">
                  <div className="mr-3 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.resources.length} resources available</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="space-y-3">
                    {module.resources.map((resource, resourceIndex) => (
                      <Card key={resourceIndex} className="overflow-hidden border border-gray-200">
                        <div className="flex items-center p-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
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
                            <p className="text-sm text-gray-500">Source: {resource.source}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-2" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Award className="h-4 w-4 mr-1 text-amber-500" />
                    <span>Complete this module to earn a badge</span>
                  </div>
                  <Button variant="outline" className="gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Mark as Complete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}