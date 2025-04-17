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
import { Loader2, User, Lock } from "lucide-react";
import govcioLogo from "@assets/Govcio_logo-removebg-preview.png";

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
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mb-8 flex justify-center">
          <img 
            src={govcioLogo} 
            alt="GOVCIO Logo" 
            className="h-16 object-contain"
          />
        </div>
        
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1A3A6E] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to GOVCIO/SAMS ELT Program</p>
          </div>
          
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
                    <FormLabel className="text-[#1A3A6E] font-medium">Username</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          autoComplete="username"
                          className="pl-10 py-6 border-gray-300 bg-gray-50 focus:ring-[#00A6ED] focus:border-[#00A6ED]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A3A6E] font-medium">Password</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="pl-10 py-6 border-gray-300 bg-gray-50 focus:ring-[#00A6ED] focus:border-[#00A6ED]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full py-6 bg-gradient-to-r from-[#0A2463] to-[#00A6ED] hover:from-[#071A4A] hover:to-[#0095D8] text-white font-medium rounded-md shadow-md"
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
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>SALIENT ARABIA FOR MILITARY SUPPORT</p>
          </div>
        </div>
      </div>
    </div>
  );
}