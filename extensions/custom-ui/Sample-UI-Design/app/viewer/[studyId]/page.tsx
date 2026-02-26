'use client';

import { useParams } from 'next/navigation';
import { ViewerPage } from '../../components/ViewerPage';

export default function Viewer() {
  const params = useParams();
  // params.studyId will be available here if needed by ViewerPage, 
  // or ViewerPage can use useParams() itself if it's updated to use next/navigation
  
  return <ViewerPage />;
}
