import { ProtectedRoute } from '../components/RouteGuards';
import Upload from '../components/Upload';

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <Upload />
    </ProtectedRoute>
  );
}