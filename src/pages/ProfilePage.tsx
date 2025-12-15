import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Settings, 
  Edit, 
  Camera, 
  Save,
  X,
  Star,
  Calendar,
  Package,
  CreditCard
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const ProfilePage: React.FC = () => {
  const { currentUser, products, getProduct } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl mb-4">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your profile
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.location.hash = 'login'}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.hash = 'signup'}
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const wishlistProducts = currentUser.wishlist
    .map(productId => getProduct(productId))
    .filter(Boolean);

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          className="glass-panel rounded-xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-cyan-400/30"
                whileHover={{ scale: 1.05 }}
              >
                <ImageWithFallback
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-cyan-500 hover:bg-cyan-400"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedUser?.username || ''}
                      onChange={(e) => setEditedUser(prev => prev ? {...prev, username: e.target.value} : null)}
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser?.email || ''}
                      onChange={(e) => setEditedUser(prev => prev ? {...prev, email: e.target.value} : null)}
                      className="bg-white/5 border-white/20"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl mb-2">{currentUser.username}</h1>
                  <p className="text-muted-foreground text-lg">{currentUser.email}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30">
                      Cybernaut Level 5
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
                      Premium Member
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl neon-text-cyan">{currentUser.orderHistory.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Wishlist Items</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl neon-text-purple">{currentUser.wishlist.length}</div>
                    <p className="text-xs text-muted-foreground">
                      3 new this week
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass-panel border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">Total Spent</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl neon-text-pink">
                      ${currentUser.orderHistory.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All time
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentUser.orderHistory.slice(0, 3).map((order, index) => (
                      <motion.div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg neon-text-cyan">${order.total.toLocaleString()}</p>
                          <Badge 
                            className={`text-xs ${
                              order.status === 'delivered' 
                                ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Your Wishlist</CardTitle>
                  <CardDescription>Items you're interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistProducts.map((product, index) => (
                        <motion.div
                          key={product!.id}
                          className="glass-panel rounded-lg p-4 hover-lift"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                            <ImageWithFallback
                              src={product!.images[0]}
                              alt={product!.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-medium mb-2">{product!.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product!.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg neon-text-cyan">
                              ${product!.price.toLocaleString()}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => window.location.hash = `product/${product!.id}`}
                              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                            >
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg mb-2">Your wishlist is empty</h3>
                      <p className="text-muted-foreground mb-6">
                        Start exploring and add some products to your wishlist
                      </p>
                      <Button
                        onClick={() => window.location.hash = 'products'}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                      >
                        Browse Products
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>All your past orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentUser.orderHistory.map((order, index) => (
                      <motion.div
                        key={order.id}
                        className="flex items-center justify-between p-6 rounded-lg bg-white/5 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                            <Package className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">Order #{order.id.toUpperCase()}</p>
                            <p className="text-muted-foreground flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {order.date}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl neon-text-cyan">${order.total.toLocaleString()}</p>
                          <Badge 
                            className={`text-xs mt-2 ${
                              order.status === 'delivered' 
                                ? 'bg-green-500/20 text-green-400 border-green-400/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
                            }`}
                          >
                            {order.status}
                          </Badge>
                          <div className="mt-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          Receive updates about your orders and new products
                        </span>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div>
                      <Label htmlFor="privacy">Privacy Settings</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          Control who can see your profile and activity
                        </span>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div>
                      <Label htmlFor="security">Security</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          Change password and enable two-factor authentication
                        </span>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div>
                      <Label htmlFor="delete">Danger Zone</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-destructive">
                          Permanently delete your account and all data
                        </span>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};