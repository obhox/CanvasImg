import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Environment Variables:', {
  supabaseUrl,
  supabaseAnonKey,
  env: process.env
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
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
    console.log('Starting image upload:', { fileName: file.name, fileSize: file.size, fileType: file.type });
    
    // Verify bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    console.log('Available buckets:', buckets);

    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw new Error(`Could not verify storage bucket: ${bucketsError.message}`);
    }

    const bucketExists = buckets.some(b => b.name === bucket);
    if (!bucketExists) {
      console.error('Available buckets:', buckets.map(b => b.name));
      throw new Error(`Storage bucket "${bucket}" does not exist. Available buckets: ${buckets.map(b => b.name).join(', ')}`);
    }

    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Generated file path:', filePath);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      if (error.message.includes('duplicate')) {
        throw new Error('A file with this name already exists');
      } else if (error.message.includes('permission')) {
        throw new Error('You do not have permission to upload files. Please sign in.');
      } else if (error.message.includes('bucket')) {
        throw new Error(`Bucket error: ${error.message}. Please ensure the 'images' bucket exists and is properly configured.`);
      } else {
        throw error;
      }
    }

    if (!data) {
      throw new Error('Upload successful but no data returned');
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file');
    }

    console.log('Public URL generated:', urlData.publicUrl);

    return {
      path: filePath,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload function error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
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