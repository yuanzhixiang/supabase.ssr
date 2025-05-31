import { createStorageFromOptions } from "./cookies";
import { CookieMethodsBrowserDeprecated, CookieOptionsWithName } from "./types";
import { CookieMethodsBrowser } from "./types";
import { isBrowser } from "./utils/helpers";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  GenericSchema,
  SupabaseClientOptions,
} from "@supabase/supabase-js/dist/module/lib/types";
import { VERSION } from "./version";

let cachedBrowserClient: SupabaseClient<any, any, any> | undefined;



export function createBrowserClient<
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any,
>(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<SchemaName> & {
    cookies: CookieMethodsBrowserDeprecated;
    cookieOptions?: CookieOptionsWithName;
    cookieEncoding?: "raw" | "base64url";
    isSingleton?: boolean;
  },
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
      `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
    );
  }

  const { storage } = createStorageFromOptions(
    {
      ...options,
      cookieEncoding: options?.cookieEncoding ?? "base64url",
    },
    false
  );
  
  const client = createClient<Database, SchemaName, Schema>(
    supabaseUrl,
    supabaseKey,
    {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          "X-Client-Info": `supabase-ssr/${VERSION} createBrowserClient`,
        },
      },
      auth: {
        ...options?.auth,
        ...(options?.cookieOptions?.name
          ? { storageKey: options.cookieOptions.name }
          : null),
        flowType: "pkce",
        autoRefreshToken: isBrowser(),
        detectSessionInUrl: isBrowser(),
        persistSession: true,
        storage,
      },
    },
  );

  if (shouldUseSingleton) {
    cachedBrowserClient = client;
  }

  return client;
}
