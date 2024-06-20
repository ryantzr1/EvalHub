// // src/app/auth/page.tsx
// "use client";
// import { useState, useEffect, Suspense } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";

// function Auth() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [isSignUp, setIsSignUp] = useState(false);
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const redirect = searchParams.get("redirect") || "/"; // Default to home page if redirect is not set

//     useEffect(() => {
//         const checkPendingEvaluation = async () => {
//             const session = JSON.parse(localStorage.getItem('supabase_session') || "null");
//             const pendingEvaluation = JSON.parse(localStorage.getItem('pending_evaluation') || "null");

//             if (session && pendingEvaluation) {
//                 try {
//                     const response = await axios.post("/api/addEvaluation", {
//                         userId: session.user.id,
//                         apiEndpoint: pendingEvaluation.apiEndpoint,
//                         temperature: pendingEvaluation.temperature,
//                         metrics: pendingEvaluation.metrics,
//                     });

//                     // Clear the pending evaluation from localStorage
//                     localStorage.removeItem('pending_evaluation');
//                 } catch (error) {
//                     console.error("Error adding pending evaluation:", error);
//                 }
//             }
//         };

//         checkPendingEvaluation();
//     }, []);

//     const handleAuth = async () => {
//         try {
//             const url = isSignUp ? "/api/signup" : "/api/signin";
//             const response = await axios.post(url, { email, password });

//             if (response.data.session) {
//                 // Save session data in localStorage
//                 localStorage.setItem('supabase_session', JSON.stringify(response.data.session));

//                 // Redirect to the original page
//                 router.push(redirect);
//             } else {
//                 console.error("Authentication failed");
//             }
//         } catch (error) {
//             console.error("Error with authentication:", error);
//         }
//     };

//     return (
//         <div className="container mx-auto px-4 md:px-6 py-12">
//             <h1 className="text-3xl font-bold mb-8">{isSignUp ? "Sign Up" : "Sign In"}</h1>
//             <div className="mb-4">
//                 <Input
//                     type="email"
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
//                 />
//             </div>
//             <div className="mb-4">
//                 <Input
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
//                 />
//             </div>
//             <Button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Sign In"}</Button>
//             <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
//                 {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
//             </Button>
//         </div>
//     );
// }

// export default function AuthPage() {
//     return (
//         <Suspense fallback={<div>Loading...</div>}>
//             <Auth />
//         </Suspense>
//     );
// }
