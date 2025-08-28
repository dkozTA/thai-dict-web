import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/Pagelayout';

const QuizMode = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  
  return (
    <PageLayout title="Quiz Mode">
      <div style={{maxWidth: '900px', margin: '0 auto', padding: '2rem'}}>
        <button 
          style={{padding: '0.75rem 1.2rem', marginBottom: '2rem'}}
          onClick={() => navigate('/learning')}
        >
          ← Trở về
        </button>
        <h1>Quiz Mode - Notebook ID: {notebookId}</h1>
        <p>Tính năng này đang được phát triển...</p>
      </div>
    </PageLayout>
  );
};

export default QuizMode;