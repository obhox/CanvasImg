import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Storage helper functions
export const uploadImage = async (file, bucket = 'images') => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, SVG, and GIF files are allowed.');
    }

    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Sanitize filename
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(fileExt)) {
      throw new Error('Invalid file extension.');
    }

    // Generate a secure random filename
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Verify bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;

    const bucketExists = buckets.some(b => b.name === bucket);
    if (!bucketExists) {
      throw new Error(`Storage bucket "${bucket}" does not exist.`);
    }

    // Upload with content type verification
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    return data;

  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

export const getImageUrl = (path, bucket = 'images') => {
  if (!path) {
    console.error('No path provided to getImageUrl');
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return publicUrl;
};

// Canvas data helper functions
export const saveCanvas = async (canvasData) => {
  const { data, error } = await supabase
    .from('canvases')
    .insert([canvasData])
    .select();

  if (error) throw error;
  return data[0];
};

export const getCanvases = async (userId) => {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateCanvas = async (id, updates) => {
  const { data, error } = await supabase
    .from('canvases')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteCanvas = async (id) => {
  const { error } = await supabase
    .from('canvases')
    .delete()
    .eq('id', id);

  if (error) throw error;
}; 