import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Eye, EyeOff, Zap, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { authAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';

export const SignupPage: React.FC = () => {
  const { refreshAuth } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.signup(
        formData.email,
        formData.password,
        formData.username
      );
      
      if (response.success) {
        toast.success('Account created successfully!', {
          description: 'Logging you in...'
        });
        
        // Auto-login after signup
        try {
          const loginResponse = await authAPI.login(formData.email, formData.password);
          if (loginResponse.success) {
            // Refresh auth state
            await refreshAuth();
            
            // Redirect to home
            window.location.hash = 'home';
          } else {
            // If auto-login fails, redirect to login page
            toast.info('Please login with your credentials');
            window.location.hash = 'login';
          }
        } catch (loginErr) {
          // If auto-login fails, redirect to login page
          toast.info('Please login with your credentials');
          window.location.hash = 'login';
        }
      } else {
        setError(response.message || 'Signup failed');
        toast.error('Signup failed', {
          description: response.message || 'Please try again'
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to connect to server';
      setError(errorMessage);
      toast.error('Signup failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    window.location.href = authAPI.getGoogleLoginUrl();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value as string));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Back Button */}
        <motion.button
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => window.history.back()}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-panel border-white/10">
            <CardHeader className="text-center">
              <motion.div
                className="flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl">Join FutureLab</CardTitle>
              <CardDescription>
                Create your account and explore the future
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="cybernaut_alex"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-white/5 border-white/20 focus:border-cyan-400 focus:neon-glow-cyan transition-all"
                    required
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@future.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/5 border-white/20 focus:border-cyan-400 focus:neon-glow-cyan transition-all"
                    required
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-white/5 border-white/20 focus:border-cyan-400 focus:neon-glow-cyan transition-all pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <motion.div
                            className={`h-full rounded-full ${getPasswordStrengthColor()}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-400' : ''}`}>
                          <Check className="h-3 w-3 mr-1" />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Uppercase letter
                        </div>
                        <div className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-400' : ''}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Number
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`bg-white/5 border-white/20 focus:border-cyan-400 focus:neon-glow-cyan transition-all pr-10 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </motion.div>

                {/* Terms and Newsletter */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                      className="border-white/30 mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-cyan-400 hover:text-cyan-300"
                      >
                        Terms of Service
                      </Button>
                      {' '}and{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-cyan-400 hover:text-cyan-300"
                      >
                        Privacy Policy
                      </Button>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange('newsletter', checked as boolean)}
                      className="border-white/30 mt-1"
                    />
                    <Label htmlFor="newsletter" className="text-sm leading-relaxed">
                      Subscribe to our newsletter for the latest updates and exclusive offers
                    </Label>
                  </div>
                </motion.div>

                {/* Signup Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0"
                    disabled={isLoading || !formData.agreeToTerms}
                  >
                    <motion.div
                      className="flex items-center justify-center space-x-2"
                      animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isLoading ? Infinity : 0 }}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    </motion.div>
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Separator className="bg-white/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-4 text-xs text-muted-foreground">
                      OR CONTINUE WITH
                    </span>
                  </div>
                </motion.div>

                {/* Social Signup Buttons */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 hover:bg-white/5"
                    onClick={handleGoogleSignup}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 hover:bg-white/5"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    GitHub
                  </Button>
                </motion.div>
              </form>

              {/* Login Link */}
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-cyan-400 hover:text-cyan-300"
                    onClick={() => window.location.hash = 'login'}
                  >
                    Sign in here
                  </Button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};