import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fingerprint, Camera, CheckCircle, AlertCircle } from "lucide-react";

interface BiometricScannerProps {
  onSuccess: (score: number) => void;
  disabled?: boolean;
}

export default function BiometricScanner({ onSuccess, disabled = false }: BiometricScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; score?: number; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const simulateBiometricScan = async () => {
    setScanning(true);
    setScanResult(null);

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate biometric results (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    const score = isSuccess ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 65; // 85-100 for success, 65-84 for failure

    const result = {
      success: isSuccess,
      score,
      message: isSuccess 
        ? `Fingerprint verified successfully (${score}% match)`
        : `Fingerprint verification failed (${score}% match - below threshold)`
    };

    setScanResult(result);
    setScanning(false);

    if (isSuccess) {
      setShowModal(true);
      setTimeout(() => {
        onSuccess(score);
        setShowModal(false);
        setScanResult(null);
      }, 3000);
    }
  };

  const tryFaceRecognition = async () => {
    setScanning(true);
    setScanResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Face recognition has higher success rate as fallback
    const isSuccess = Math.random() > 0.05;
    const score = isSuccess ? Math.floor(Math.random() * 10) + 90 : Math.floor(Math.random() * 15) + 70;

    const result = {
      success: isSuccess,
      score,
      message: isSuccess 
        ? `Face recognition successful (${score}% match)`
        : `Face recognition failed (${score}% match)`
    };

    setScanResult(result);
    setScanning(false);

    if (isSuccess) {
      setShowModal(true);
      setTimeout(() => {
        onSuccess(score);
        setShowModal(false);
        setScanResult(null);
      }, 3000);
    }
  };

  return (
    <>
      {/* Biometric Scanner Interface */}
      <Card className="bg-gray-50 border-2 border-dashed border-gray-300 p-8 text-center">
        <div 
          className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
            scanning ? 'animate-pulse scale-110' : 'hover:scale-105'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={!disabled && !scanning ? simulateBiometricScan : undefined}
          data-testid="button-fingerprint-scanner"
        >
          <Fingerprint className="text-3xl text-white" />
        </div>
        
        {scanning && (
          <div className="text-blue-600 font-medium mb-2" data-testid="text-scanning">
            Scanning fingerprint...
          </div>
        )}
        
        {scanResult && (
          <div className={`mb-4 p-3 rounded-lg ${
            scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {scanResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`} data-testid="text-scan-result">
                {scanResult.message}
              </span>
            </div>
          </div>
        )}
        
        {!scanning && (
          <>
            <p className="text-sm text-gray-600 mb-2" data-testid="text-scanner-instruction">
              {scanResult?.success ? 'Verification complete!' : 'Place finger on scanner'}
            </p>
            <p className="text-xs text-muted-foreground">Or use face recognition as backup</p>
          </>
        )}
        
        {/* Face Recognition Fallback */}
        {scanResult && !scanResult.success && (
          <Button 
            onClick={tryFaceRecognition}
            disabled={scanning || disabled}
            variant="outline"
            className="mt-3"
            data-testid="button-face-recognition"
          >
            <Camera className="mr-2 h-4 w-4" />
            Try Face Recognition
          </Button>
        )}
      </Card>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-biometric-success">
          <Card className="p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Fingerprint className="text-5xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2" data-testid="text-verification-title">Biometric Verification</h3>
              <p className="text-muted-foreground mb-6" data-testid="text-verification-message">{scanResult?.message}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Match Score:</span>
                  <span className="font-medium text-green-600" data-testid="text-match-score">{scanResult?.score}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Location:</span>
                  <span className="font-medium text-green-600" data-testid="text-location-verified">Verified</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time:</span>
                  <span className="font-medium" data-testid="text-verification-time">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
