
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

/**
 * Type-safe function to select data from a table
 */
export async function selectFromTable<T = any>(
  table: string,
  columns: string,
  filter?: Record<string, any>,
  options?: {
    limit?: number;
    order?: { column: string; ascending: boolean };
  }
) {
  let query = supabase
    .from(table as any)
    .select(columns);

  // Apply filters if provided
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      // Type assertion to handle dynamic query building
      query = query.eq(key, value) as any;
    });
  }

  // Apply limit if provided
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  // Apply order if provided
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending });
  }

  return query;
}

/**
 * Type-safe function to insert data into a table
 */
export async function insertIntoTable<T = any>(
  table: string,
  data: Record<string, any> | Record<string, any>[]
) {
  return supabase
    .from(table as any)
    .insert(data as any);
}

/**
 * Type-safe function to update data in a table
 */
export async function updateTable<T = any>(
  table: string,
  data: Record<string, any>,
  filter: Record<string, any>
) {
  let query = supabase
    .from(table as any)
    .update(data);

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value) as any;
  });

  return query;
}

/**
 * Type-safe function to delete data from a table
 */
export async function deleteFromTable(
  table: string,
  filter: Record<string, any>
) {
  let query = supabase
    .from(table as any)
    .delete();

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value) as any;
  });

  return query;
}

/**
 * Type-safe function to call an RPC function
 */
export async function callRpcFunction(
  functionName: string,
  params?: Record<string, any>
) {
  return supabase
    .rpc(functionName, params || {});
}
