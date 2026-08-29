import { TodoWorkspace } from '@/components/lab/todoWorkspace';

export default async function TodoPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <TodoWorkspace slug={slug} />;
}
