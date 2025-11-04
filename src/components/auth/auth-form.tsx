"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFirebase } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const { auth } = useFirebase();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    console.log("AuthForm: onSubmit triggered.", { isLogin, data: { email: data.email } });
    if (!auth) {
      console.error("AuthForm: Firebase auth is not initialized.");
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Firebase is not initialized. Please try again later.",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        console.log("AuthForm: Attempting to sign in...");
        await signInWithEmailAndPassword(auth, data.email, data.password);
        console.log("AuthForm: Sign in successful.");
      } else {
        console.log("AuthForm: Attempting to create user...");
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        console.log("AuthForm: User creation successful.");
      }
      // The onAuthStateChanged listener in the provider will handle the redirect.
      // We don't need to setLoading(false) here because the component will unmount on redirect.
      console.log("AuthForm: Auth action completed, waiting for redirect.");
    } catch (error: any) {
      console.error("AuthForm: Authentication failed.", { code: error.code, message: error.message });
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unexpected error occurred.",
      });
      setLoading(false); // Reset loading state on error
    }
  };

  return (
    <Card className="shadow-neumorphic border-none">
      <CardHeader>
        <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Enter your credentials to access your dashboard."
            : "Create a new account to get started."}
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
            {errors.email && (
              <p className="text-destructive text-sm mt-1">
                {errors.email.message}
              </p>
            )}
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
            {errors.password && (
              <p className="text-destructive text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full shadow-neumorphic active:shadow-neumorphic-inset"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-muted-foreground"
          >
            {isLogin
              ? "Need an account? Sign Up"
              : "Already have an account? Sign In"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
