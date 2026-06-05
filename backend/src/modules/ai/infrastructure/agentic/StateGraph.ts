export const START = "__START__";
export const END = "__END__";

export class StateGraph<State extends Record<string, any>> {
  private nodes: Map<string, (state: State) => Promise<Partial<State> | void>> = new Map();
  private edges: Map<string, string> = new Map();
  private conditionalEdges: Map<
    string,
    {
      routerFn: (state: State) => string | Promise<string>;
      pathMap?: Record<string, string>;
    }
  > = new Map();

  addNode(name: string, nodeFn: (state: State) => Promise<Partial<State> | void>): this {
    this.nodes.set(name, nodeFn);
    return this;
  }

  addEdge(from: string, to: string): this {
    this.edges.set(from, to);
    return this;
  }

  addConditionalEdges(
    from: string,
    routerFn: (state: State) => string | Promise<string>,
    pathMap?: Record<string, string>
  ): this {
    this.conditionalEdges.set(from, { routerFn, pathMap });
    return this;
  }

  compile() {
    return {
      execute: async (initialState: State): Promise<State> => {
        let state = { ...initialState };
        let currentNode = START;

        // Prevent infinite loops in edge traversal
        let steps = 0;
        const maxSteps = 100;

        while (currentNode !== END) {
          steps++;
          if (steps > maxSteps) {
            throw new Error(`StateGraph execution exceeded max steps limit of ${maxSteps}. Infinite loop detected.`);
          }

          if (currentNode === START) {
            const nextNode = this.edges.get(START);
            if (!nextNode) {
              throw new Error("No edge defined from START");
            }
            currentNode = nextNode;
            continue;
          }

          // Execute current node
          const nodeFn = this.nodes.get(currentNode);
          if (!nodeFn) {
            throw new Error(`Node function not found for: ${currentNode}`);
          }

          const result = await nodeFn(state);
          if (result) {
            state = { ...state, ...result };
          }

          // Determine next node
          if (this.edges.has(currentNode)) {
            currentNode = this.edges.get(currentNode)!;
          } else if (this.conditionalEdges.has(currentNode)) {
            const { routerFn, pathMap } = this.conditionalEdges.get(currentNode)!;
            const routeKey = await routerFn(state);
            let nextNode = routeKey;
            if (pathMap && pathMap[routeKey]) {
              nextNode = pathMap[routeKey];
            }
            currentNode = nextNode;
          } else {
            // Default edge to end if none specified
            currentNode = END;
          }
        }

        return state;
      },
    };
  }
}
