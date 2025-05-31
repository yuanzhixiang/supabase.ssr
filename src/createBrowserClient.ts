import { isBrowser } from "./utils/helpers";
import { SupabaseClient } from "@supabase/supabase-js";

let cachedBrowserClient: SupabaseClient<any, any, any> | undefined;

export function createBrowserClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: {
    isSingleton?: boolean;
  }
) {
  const shouldUseSingleton =
    // 如果指定了 isSingleton 为 true 则 shouldUseSingleton 为 true
    options?.isSingleton === true ||
    // 如果 options 为 undefined 或者 options 中没有 isSingleton 属性
    // 则 shouldUseSingleton 要看是否在浏览器中，在浏览器中则应该使用单例
    ((!options || !("isSingleton" in options)) && isBrowser());

  if (shouldUseSingleton && cachedBrowserClient) {
    return cachedBrowserClient;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`,
    );
  }

  
  console.log("createBrowserClient");
}
