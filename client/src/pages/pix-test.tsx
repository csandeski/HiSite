import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PixTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPix = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test the PIX endpoint
      const response = await fetch('/api/test/pix', {
        method: 'GET',
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      console.log('Response status:', response.status);
      console.log('Response content-type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setError(`Received non-JSON response: ${text.substring(0, 200)}...`);
        return;
      }

      const data = await response.json();
      console.log('PIX test result:', data);
      setResult(data);

      if (!data.success) {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPixPayment = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test the actual PIX payment endpoint
      const response = await fetch('/api/payment/create-pix-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'pix_key_auth',
          amount: 19.90
        })
      });

      const contentType = response.headers.get('content-type');
      console.log('Payment response status:', response.status);
      console.log('Payment response content-type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON payment response:', text);
        setError(`Received non-JSON response: ${text.substring(0, 200)}...`);
        return;
      }

      const data = await response.json();
      console.log('PIX payment result:', data);
      setResult(data);

      if (!data.success) {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Payment test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testLegacyEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test the legacy endpoint
      const response = await fetch('/api/payment/pix-key-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'pix_key_auth',
          amount: 19.90
        })
      });

      const contentType = response.headers.get('content-type');
      console.log('Legacy response status:', response.status);
      console.log('Legacy response content-type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON legacy response:', text);
        setError(`Received non-JSON response: ${text.substring(0, 200)}...`);
        return;
      }

      const data = await response.json();
      console.log('Legacy PIX result:', data);
      setResult(data);

      if (!data.success) {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Legacy test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">PIX Test Page</h1>
        
        <Card className="p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Test PIX Endpoints</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={testPix} 
              disabled={loading}
              className="w-full"
              data-testid="test-pix-basic"
            >
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Test Basic PIX Generation
            </Button>

            <Button 
              onClick={testPixPayment} 
              disabled={loading}
              variant="secondary"
              className="w-full"
              data-testid="test-pix-payment"
            >
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Test PIX Payment (create-pix-auth)
            </Button>

            <Button 
              onClick={testLegacyEndpoint} 
              disabled={loading}
              variant="outline"
              className="w-full"
              data-testid="test-pix-legacy"
            >
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Test Legacy Endpoint (pix-key-auth)
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="p-6 mb-4 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </Card>
        )}

        {result && (
          <Card className="p-6 mb-4 border-green-200 bg-green-50">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Result</h3>
            <pre className="text-sm text-green-600 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Click "Test Basic PIX Generation" to test LiraPay API directly</li>
            <li>Click "Test PIX Payment" to test the correct endpoint</li>
            <li>Click "Test Legacy Endpoint" to test the backwards compatibility</li>
            <li>Check the console (F12) for detailed logs</li>
            <li>If you see HTML responses, the error will be shown above</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}