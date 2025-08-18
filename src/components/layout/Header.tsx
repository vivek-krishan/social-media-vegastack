"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell, MessageCircle } from "lucide-react";
import { Button } from "../ui/button";
import { User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";

interface NavItemProps {
  label: string;
  active?: boolean;
  badge?: string;
  destination?: string;
}

const Header = () => {
  const { data: session, status } = useSession();
  const user: User = session?.user as User;
  const router = useRouter();
  const pathname = usePathname();

  const NavItem = ({ label, badge, destination }: NavItemProps) => {
    return (
      <Button
        variant={"link"}
        onClick={() => destination && router.replace(destination)}
        className={`px-3 py-1 text-sm relative ${
          destination === pathname
            ? "text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {label}
        {badge && (
          <span className='absolute -top-1 -right-1 bg-gray-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
            {badge}
          </span>
        )}
        {destination === pathname && (
          <div className='absolute bottom-0 left-0 w-full h-0.5 bg-blue-500'></div>
        )}
      </Button>
    );
  };

  return (
    <header className='h-14 border-b border-gray-800 bg-[#1A1B21] flex items-center px-4'>
      <div className='flex items-center space-x-4'>
        <NavItem label='Home' destination={"/my-feed"} active />
        <NavItem label='Explore' destination={"/global-feed"} />
        {/* <NavItem label='Community feed' />
        <NavItem label='Mutual friend' badge='12' /> */}
      </div>
      <div className='ml-auto flex items-center space-x-4'>
        <button className='text-gray-300 hover:text-white'>
          <MessageCircle size={20} />
        </button>
        <button className='text-gray-300 hover:text-white'>
          <Bell size={20} />
        </button>
        <div className='flex items-center'>
          <Button
            onClick={() => {
              signOut();
              router.replace("/sign-in");
            }}
          >
            Log out
          </Button>
          <Button
            variant={"secondary"}
            className='cursor-pointer '
            onClick={() => router.replace(`/profile?userId=${user._id}`)}
          >
            <span className='text-sm font-bold'>{user?.name}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
