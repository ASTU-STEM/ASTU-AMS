import { StateGraph, START, END, Annotation } from '@langchain/langgraph';

describe('StateGraph Helper class', () => {
  it('should compile and run node workflows successfully', async () => {
    const TestStateAnnotation = Annotation.Root({
      count: Annotation<number>,
    });

    const runnable = new StateGraph(TestStateAnnotation)
      .addNode('increment', async (state) => {
        return { count: state.count + 1 };
      })
      .addEdge(START, 'increment')
      .addEdge('increment', END)
      .compile();

    const result = await runnable.invoke({ count: 5 });

    expect(result.count).toBe(6);
  });

  it('should route via conditional edges correctly', async () => {
    const TestStateAnnotation = Annotation.Root({
      val: Annotation<string>,
      route: Annotation<string>,
    });

    const runnable = new StateGraph(TestStateAnnotation)
      .addNode('start_node', async () => {
        return { val: 'hello' };
      })
      .addNode('route_a', async () => {
        return { route: 'took A' };
      })
      .addNode('route_b', async () => {
        return { route: 'took B' };
      })
      .addEdge(START, 'start_node')
      .addConditionalEdges(
        'start_node',
        (state) => (state.val === 'hello' ? 'a' : 'b'),
        {
          a: 'route_a',
          b: 'route_b',
        }
      )
      .addEdge('route_a', END)
      .addEdge('route_b', END)
      .compile();

    const result = await runnable.invoke({ val: '', route: '' });

    expect(result.val).toBe('hello');
    expect(result.route).toBe('took A');
  });
});
