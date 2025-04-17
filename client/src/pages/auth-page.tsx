import { useAuth, loginSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }

  // If the user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-[#0F1E45] rounded-lg overflow-hidden">
      {/* Left side with image */}
      <div className="hidden md:block md:w-[45%] relative overflow-hidden rounded-r-3xl">
        <div 
          className="h-full w-full bg-cover bg-center relative"
          style={{ 
            backgroundImage: "url('https://img.freepik.com/free-photo/diverse-group-students-learning-classroom_53876-138094.jpg')",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1e4b]/10 to-[#0a1e4b]/60"></div>
          {/* Blue vertical accent */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#0066CC]"></div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <img 
              src="/Govcio_logo-removebg-preview.png" 
              alt="GOVCIO Logo" 
              className="h-16 object-contain"
            />
            <p className="text-xs text-white/70 mt-1">SALIENT ARABIA FOR MILITARY SUPPORT</p>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Continue transforming learning outcomes.</p>
          </div>
          
          {/* Form */}
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-6"
            >
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        autoComplete="username"
                        className="py-6 bg-white/10 text-white border-0 focus-visible:ring-1 focus-visible:ring-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="py-6 bg-white/10 text-white border-0 focus-visible:ring-1 focus-visible:ring-white/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full py-7 bg-[#0A366C] hover:bg-[#0A366C]/90 text-white font-medium rounded-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          
          {/* Forgot Password */}
          <div className="mt-4 text-right">
            <a href="#" className="text-sm text-white/70 hover:text-white">
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}