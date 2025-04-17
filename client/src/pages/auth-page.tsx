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
    <div className="flex items-center justify-center min-h-screen bg-[#3668c9] p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden shadow-xl flex">
        {/* Left side with image */}
        <div className="hidden md:block w-1/2 relative">
          <div 
            className="h-full w-full bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://img.freepik.com/free-photo/teacher-showing-something-tablet-students_23-2148204419.jpg?w=900&t=st=1713428520~exp=1713429120~hmac=5f31ee7fb73156c05762c34b8dc5af6e128aa5c8a7dba5d30c45b6dc67e18ccb')"
            }}
          >
            {/* Blue diagonal overlay */}
            <div className="absolute inset-0 bg-[#3668c9] opacity-20"></div>
            
            {/* Blue edge accent */}
            <div 
              className="absolute right-0 top-0 bottom-0" 
              style={{
                width: '40px',
                background: '#3668c9',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 40% 100%)'
              }}
            ></div>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full md:w-1/2 px-8 py-12 md:px-12">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <img 
                src="/Updated logo.png" 
                alt="GOVCIO Logo" 
                className="h-12 object-contain"
              />
            </div>

            {/* Welcome text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Continue transforming learning outcomes.</p>
            </div>
            
            {/* Form */}
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          autoComplete="username"
                          defaultValue="Moon2025"
                          className="py-6 bg-[#e8f0fe] border-0 rounded-md"
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
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="py-6 bg-[#e8f0fe] border-0 rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full py-6 mt-2 bg-[#0a2366] hover:bg-[#071a4b] text-white font-medium rounded-md"
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
              <a href="#" className="text-sm text-[#3668c9] hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}