"use client";
import React, { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PLATFORM_NAME } from "@/helpers/constants";
import axios from "axios";
import { IUser } from "@/models/user.model";
import { useDebounce } from "@/lib/useDebounce";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [loader, setLoader] = useState({
    searchFriends: false,
    fetchFollowers: false,
  });

  const [followers, setFollowers] = useState<IUser[]>([]);
  const [followings, setFollowings] = useState<IUser[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ show/hide states
  const [showFollowers, setShowFollowers] = useState(true);
  const [showFollowings, setShowFollowings] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(true);

  // ✅ Fetch my followers
  const fetchFollowers = async () => {
    setLoader((prev) => ({ ...prev, fetchFollowers: true }));
    try {
      const res = await axios.get("/api/user/followers");
      setFollowers(res.data.data || []);
    } catch (error) {
      console.log("Error fetching followers:", error);
    } finally {
      setLoader((prev) => ({ ...prev, fetchFollowers: false }));
    }
  };

  // ✅ Fetch my followings
  const fetchFollowings = async () => {
    setLoader((prev) => ({ ...prev, fetchFollowers: true }));
    try {
      const res = await axios.get("/api/user/followings");
      setFollowings(res.data.data || []);
    } catch (error) {
      console.log("Error fetching followings:", error);
    } finally {
      setLoader((prev) => ({ ...prev, fetchFollowers: false }));
    }
  };

  // ✅ Fetch all global users
  const fetchAllUsers = async () => {
    setLoader((prev) => ({ ...prev, fetchFollowers: true }));
    try {
      const res = await axios.get("/api/user/all-user");
      setAllUsers(res.data.data || []);
    } catch (error) {
      console.log("Error fetching all users:", error);
    } finally {
      setLoader((prev) => ({ ...prev, fetchFollowers: false }));
    }
  };

  // ✅ Search users by name/email/mobile
  const SearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]); // clear search results if query empty
      return;
    }

    setLoader((prev) => ({ ...prev, searchFriends: true }));
    try {
      const res = await axios.get(`/api/user/search?query=${query}`);
      setSearchResults(res.data.dataArray || []);
    } catch (error) {
      console.log("Error searching users:", error);
    } finally {
      setLoader((prev) => ({ ...prev, searchFriends: false }));
    }
  };

  const handleSearch = useDebounce(SearchUsers, 1000);

  useEffect(() => {
    fetchFollowers();
    fetchFollowings();
    fetchAllUsers();
  }, []);

  return (
    <div className='w-64 h-full bg-[#1A1B21] border-r border-gray-800 flex flex-col'>
      {/* Header */}
      <div className='p-4 flex items-center'>
        <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2'>
          <span className='font-bold'>{PLATFORM_NAME.at(0)}</span>
        </div>
        <h1 className='text-xl font-semibold text-blue-400'>{PLATFORM_NAME}</h1>
      </div>

      {/* Search Bar */}
      <div className='px-4 py-2'>
        <div className='flex items-center px-3 py-2 bg-[#242731] rounded-md'>
          <Search className='h-4 w-4 text-gray-400 mr-2' />
          <input
            type='text'
            placeholder='Explore...'
            onChange={(e) => handleSearch(e.target.value)}
            className='bg-transparent border-none outline-none text-sm text-gray-300 w-full'
          />
        </div>
      </div>

      {/* Display either search results OR full lists */}
      <div className='p-4 overflow-y-auto'>
        {searchQuery.trim() ? (
          <>
            <h3 className='font-medium mb-2'>Search Results</h3>
            {loader.searchFriends ? (
              <p className='text-sm text-gray-400'>Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className='text-sm text-gray-400'>No results found</p>
            ) : (
              <div className='space-y-3'>
                {searchResults.map((user) => (
                  <FriendItem
                    key={user._id.toString()}
                    name={user.name}
                    status='Search result'
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Followers */}
            <div className='mb-6'>
              <div
                className='flex justify-between items-center mb-2 cursor-pointer'
                onClick={() => setShowFollowers((prev) => !prev)}
              >
                <h3 className='font-medium'>My Followers</h3>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    showFollowers ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
              {showFollowers && (
                <div className='space-y-3'>
                  {followers.length === 0 ? (
                    <p className='text-sm text-gray-400'>No followers</p>
                  ) : (
                    followers.map((follower) => (
                      <FriendItem
                        key={follower._id.toString()}
                        name={follower.name}
                        status='Follower'
                        userId={follower._id as string}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Followings */}
            <div className='mb-6'>
              <div
                className='flex justify-between items-center mb-2 cursor-pointer'
                onClick={() => setShowFollowings((prev) => !prev)}
              >
                <h3 className='font-medium'>My Followings</h3>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    showFollowings ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
              {showFollowings && (
                <div className='space-y-3'>
                  {followings.length === 0 ? (
                    <p className='text-sm text-gray-400'>No followings</p>
                  ) : (
                    followings.map((following) => (
                      <FriendItem
                        key={following._id.toString()}
                        name={following.name}
                        status='Following'
                        userId={following._id as string}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* All Users */}
            <div>
              <div
                className='flex justify-between items-center mb-2 cursor-pointer'
                onClick={() => setShowAllUsers((prev) => !prev)}
              >
                <h3 className='font-medium'>All Users</h3>
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    showAllUsers ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
              {showAllUsers && (
                <div className='space-y-3'>
                  {allUsers.length === 0 ? (
                    <p className='text-sm text-gray-400'>No users</p>
                  ) : (
                    allUsers.map((user) => (
                      <FriendItem
                        key={user._id.toString()}
                        name={user.name}
                        status='Global User'
                        userId={user._id as string}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface FriendItemProps {
  name: string;
  status: string;
  userId: string;
}
const FriendItem = ({ name, status, userId }: FriendItemProps) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.replace(`/profile?userId=${userId}`)}
      className='flex items-center'
    >
      <div className='w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2'>
        <span className='font-bold'>{name.at(0)?.toUpperCase()}</span>
      </div>
      <div className='flex-1'>
        <p className='text-sm'>{name}</p>
        <p className='text-xs text-gray-400'>{status}</p>
      </div>
    </div>
  );
};

export default Sidebar;
