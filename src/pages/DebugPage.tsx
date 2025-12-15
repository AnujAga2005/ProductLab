import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const DebugPage: React.FC = () => {
  const { products, bundles, currentUser, cart, isLoading, isBackendConnected } = useApp();

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-4">🔧 Debug Information</h1>
          <p className="text-muted-foreground">
            This page shows the current state of the application
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isBackendConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Backend Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={isBackendConnected ? "default" : "destructive"}>
                    {isBackendConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <Badge variant={isLoading ? "secondary" : "outline"}>
                    {isLoading ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {products.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <Badge>{products.length}</Badge>
                </div>
                <div className="flex justify-between items-start">
                  <span>IDs:</span>
                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {products.slice(0, 10).map((p) => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.id}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bundles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {bundles.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Bundles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Count:</span>
                  <Badge>{bundles.length}</Badge>
                </div>
                <div className="flex justify-between items-start">
                  <span>IDs:</span>
                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {bundles.slice(0, 10).map((b) => (
                      <Badge key={b.id} variant="outline" className="text-xs">
                        {b.id}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentUser ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={currentUser ? "default" : "outline"}>
                    {currentUser ? "Logged In" : "Not Logged In"}
                  </Badge>
                </div>
                {currentUser && (
                  <>
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="text-sm">{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {cart.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <Badge>{cart.length}</Badge>
                </div>
                {cart.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Cart Contents:</p>
                    <div className="space-y-1">
                      {cart.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Product ID: {item.productId}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Details */}
        {products.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sample Product Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                {JSON.stringify(products[0], null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="outline" onClick={() => window.location.hash = 'home'}>
            Go to Home
          </Button>
          <Button variant="outline" onClick={() => console.log({ products, bundles, currentUser, cart })}>
            Log to Console
          </Button>
        </div>

        {/* Console Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debugging Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Open browser console (F12) and look for error messages</p>
            <p>2. Check the "Log to Console" button to see full app state</p>
            <p>3. If products/bundles are 0, check backend connection</p>
            <p>4. Product IDs should match between products list and cart</p>
            <p>5. Backend should be running on: http://localhost:5001</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
