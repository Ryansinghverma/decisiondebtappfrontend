import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Lock } from 'lucide-react';

export function Profile() {
  const navigate = useNavigate();

  // Read real user from localStorage — saved when they logged in
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(storedUser?.name || '');
  const [email, setEmail] = useState(storedUser?.email || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Update localStorage with new name/email
    const updated = { ...storedUser, name, email };
    localStorage.setItem('user', JSON.stringify(updated));
    alert('Profile updated!');
  };

  const handleLogout = () => {
    // Clear everything from localStorage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  // Get initials for the avatar circle
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white border border-border rounded-lg p-8 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{initials || <User className="w-10 h-10" />}</span>
          </div>
          <div>
            <h3 className="mb-1">{name}</h3>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" size="lg">Save Changes</Button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4>Change Password</h4>
                <p className="text-muted-foreground">Update your password</p>
              </div>
            </div>
            <Button variant="secondary">Change</Button>
          </div>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-red-600">Sign Out</h4>
              <p className="text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
