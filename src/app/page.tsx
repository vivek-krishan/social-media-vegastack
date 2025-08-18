import React from "react";
import Layout from "@/components/layout/Layout";
import PostCreate from "@/components/post/PostCreate";
import PostCard from "@/components/post/PostCard";
const Home = () => {
  return (
    <Layout>
      <div className='max-w-xl mx-auto py-4'>
        <PostCreate userImage='https://randomuser.me/api/portraits/men/32.jpg' />
        <PostCard
          user={{
            name: "Lucky Andreas",
            image: "https://randomuser.me/api/portraits/men/36.jpg",
            postedTime: "2 hours ago",
            isContributor: true,
          }}
          content={{
            text: "What is the reason guys yesterday I uploaded some kind of content they approved it but when I tried to upload they say we no longer accept this type of content.",
            image:
              "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          }}
          engagement={{
            likes: 345,
            comments: 45,
            shares: 12,
          }}
        />
        <PostCard
          user={{
            name: "James Pollack",
            image: "https://randomuser.me/api/portraits/men/37.jpg",
            postedTime: "3 hours ago",
            isContributor: true,
          }}
          content={{
            text: "For those of you that have considered joining Vecteezy...here's my total sales for my first two weeks. I'm pretty happy with the results so far!",
          }}
          engagement={{
            likes: 120,
            comments: 23,
            shares: 5,
          }}
        />
      </div>
    </Layout>
  );
};
export default Home;
