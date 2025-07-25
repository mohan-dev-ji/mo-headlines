export const isAdmin = (userId: string | null | undefined) => {
  console.log('Checking admin status for user:', userId);
  console.log('Admin user ID from env:', process.env.NEXT_PUBLIC_ADMIN_USER_ID);
  
  if (!userId) {
    console.log('No user ID provided');
    return false;
  }
  
  const isAdmin = userId === process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  console.log('Is admin:', isAdmin);
  return isAdmin;
}; 