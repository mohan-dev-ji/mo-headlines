import Image from "next/image";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleList } from "@/components/article-list";
import { FeaturedArticle } from "@/components/featured-article";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-grey-50/50 flex items-center justify-center">
      <div className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Hero section */}

        {/* </header> */}
        <FeaturedArticle />
        <div className="w-full max-w-2xl mx-auto border-t-2 border-gray-100 mt-4" />
        <ArticleList />

        <SignedIn>
          <Link href="/create">
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </SignedIn>


      </div>
      
    </div>
  );
}
