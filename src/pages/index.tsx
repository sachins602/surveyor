import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyForm } from "@/components/SurveryForm";
import { ThemeProvider } from "@/components/ThemeProvider/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <main className="mt-24 flex min-h-screen flex-col items-center">
          <AuthShowcase />
        </main>
      </ThemeProvider>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {sessionData ? (
        <div className="flex flex-row gap-4">
          <ThemeToggle />
          <Tabs defaultValue="account" className="w-[400px] md:w-[600px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="filledforms">Filled Forms</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="forms">
              <SurveyForm />
            </TabsContent>
            <TabsContent value="filledforms">hi</TabsContent>
            <TabsContent value="profile">
              <h1 className="text-2xl font-bold">{sessionData.user.email}</h1>
              <Button variant="destructive" onClick={() => void signOut()}>
                Sign out
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Button onClick={() => void signIn()}>Sign in</Button>
      )}
    </div>
  );
}
