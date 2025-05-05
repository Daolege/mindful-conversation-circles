
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class CourseDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Course detail component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="my-4 border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">加载此课程区域时出现问题</h3>
              <p className="text-gray-600 mb-4">抱歉，加载此内容时发生错误。请尝试刷新页面。</p>
              <Button 
                variant="outline" 
                onClick={() => this.setState({ hasError: false })}
              >
                重试加载
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default CourseDetailErrorBoundary;
