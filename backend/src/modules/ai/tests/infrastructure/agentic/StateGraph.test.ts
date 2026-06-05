import { StateGraph, START, END } from '../../../infrastructure/agentic/StateGraph';

describe('StateGraph Helper class', () => {
  it('should compile and run node workflows successfully', async () => {
    interface TestState {
      count: number;
    }
    const graph = new StateGraph<TestState>();

    graph.addNode('increment', async (state) => {
      return { count: state.count + 1 };
    });

    graph.addEdge(START, 'increment');
    graph.addEdge('increment', END);

    const runnable = graph.compile();
    const result = await runnable.execute({ count: 5 });

    expect(result.count).toBe(6);
  });

  it('should route via conditional edges correctly', async () => {
    interface TestState {
      val: string;
      route: string;
    }
    const graph = new StateGraph<TestState>();

    graph.addNode('start_node', async () => {
      return { val: 'hello' };
    });

    graph.addNode('route_a', async () => {
      return { route: 'took A' };
    });

    graph.addNode('route_b', async () => {
      return { route: 'took B' };
    });

    graph.addEdge(START, 'start_node');
    
    graph.addConditionalEdges(
      'start_node',
      (state) => (state.val === 'hello' ? 'a' : 'b'),
      {
        a: 'route_a',
        b: 'route_b',
      }
    );

    graph.addEdge('route_a', END);
    graph.addEdge('route_b', END);

    const runnable = graph.compile();
    const result = await runnable.execute({ val: '', route: '' });

    expect(result.val).toBe('hello');
    expect(result.route).toBe('took A');
  });
});
