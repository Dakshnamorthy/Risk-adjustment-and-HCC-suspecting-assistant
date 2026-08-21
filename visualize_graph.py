from app.graph.workflow import build_workflow

def visualize_graph_png():
    app = build_workflow()

    graph = app.get_graph()

    # Save as PNG
    graph.draw_png("workflow.png")

    print("Graph saved as workflow.png")

if __name__ == "__main__":
    visualize_graph_png()