
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, Target, Heart, Globe, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";

type TeamMember = {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
};

type Stat = {
  label: string;
  value: string;
};

type AboutPageSettings = {
  id: string;
  title: string;
  subtitle: string;
  mission: string;
  vision: string;
  story: string;
  team_members: TeamMember[];
  stats: Stat[];
  is_visible: boolean;
};

const About = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["about-page-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_page_settings")
        .select("*")
        .single();

      if (error) throw error;
      
      return {
        ...data,
        team_members: Array.isArray(data.team_members) 
          ? data.team_members as TeamMember[] 
          : [],
        stats: Array.isArray(data.stats) 
          ? data.stats as Stat[] 
          : []
      } as AboutPageSettings;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!settings?.is_visible) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-knowledge-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{settings.title}</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">{settings.subtitle}</p>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="text-center md:text-left">
                <div className="inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-knowledge-soft flex items-center justify-center">
                    <Target className="h-8 w-8 text-knowledge-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">{t('common:ourMission')}</h2>
                <p className="text-gray-600">{settings.mission}</p>
              </div>
              
              <div className="text-center md:text-left">
                <div className="inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-knowledge-soft flex items-center justify-center">
                    <Heart className="h-8 w-8 text-knowledge-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">{t('common:ourVision')}</h2>
                <p className="text-gray-600">{settings.vision}</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-knowledge-gray">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t('common:ourStory')}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{settings.story}</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-knowledge-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
              {settings.stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-lg bg-knowledge-dark border border-gray-700">
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">{t('common:foundingTeam')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {settings.team_members.map((member, index) => (
                <div key={index} className="text-center">
                  <img 
                    src={member.imageUrl}
                    alt={member.name} 
                    className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-knowledge-primary mb-2">{member.title}</p>
                  <p className="text-gray-600 max-w-xs mx-auto">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
