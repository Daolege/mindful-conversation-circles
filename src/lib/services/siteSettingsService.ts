
import { supabase } from "@/integrations/supabase/client";
import { SiteSetting } from "@/lib/types/course-new";
import { toast } from "sonner";

/**
 * Fetches the site settings from the database
 * @returns Promise<SiteSetting>
 */
export const getSiteSettings = async (): Promise<SiteSetting> => {
  try {
    // Try to get site settings from the site_settings table
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching site settings:", error);
      return {};
    }

    return data || {};
  } catch (error) {
    console.error("Error in getSiteSettings:", error);
    return {};
  }
};

/**
 * Updates the site settings
 * @param settings The settings to update
 * @returns Promise<boolean>
 */
export const updateSiteSettings = async (settings: SiteSetting): Promise<boolean> => {
  try {
    // Remove any undefined values
    Object.keys(settings).forEach((key) => {
      if (settings[key as keyof SiteSetting] === undefined) {
        delete settings[key as keyof SiteSetting];
      }
    });
    
    const { error } = await supabase.from("site_settings").upsert({
      id: settings.id || "default", // Use existing ID or 'default' for new record
      site_name: settings.site_name,
      site_description: settings.site_description,
      logo_url: settings.logo_url,
      support_phone: settings.support_phone,
      contact_email: settings.contact_email,
      maintenance_mode: settings.maintenance_mode,
      enable_registration: settings.enable_registration,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error("Error updating site settings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateSiteSettings:", error);
    return false;
  }
};
