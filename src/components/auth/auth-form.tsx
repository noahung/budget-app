"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFirebase } from "@/firebase";
import { initiateEmailSignUp, initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const { auth } = useFirebase();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        initiateEmailSignIn(auth, data.email, data.password);
      } else {
        initiateEmailSignUp(auth, data.email, data.password);
      }
      // The onAuthStateChanged listener in the provider will handle the redirect.
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setLoading(false); // Reset loading on error
    }
  };

  return (
    <Card className="shadow-neumorphic border-none">
       <CardHeader>
        <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to access your dashboard." : "Create a new account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
               className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full shadow-neumorphic active:shadow-neumorphic-inset" disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-muted-foreground">
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
