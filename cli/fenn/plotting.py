"""Plotting and visualization for Fenn portfolio data"""
import plotly.graph_objects as go
import plotly.express as px
from decimal import Decimal
from typing import Dict, List, Any
import webbrowser
import tempfile
from pathlib import Path


def create_allocation_chart(holdings: Dict[str, Any], total_value: Decimal, top_n: int = 10) -> go.Figure:
    """Create a donut chart showing top holdings allocation
    
    Args:
        holdings: Dict of symbol -> holding data
        total_value: Total portfolio value
        top_n: Number of top holdings to show individually
    
    Returns:
        Plotly Figure object
    """
    # Sort by value
    sorted_holdings = sorted(holdings.items(), key=lambda x: x[1]['total_value'], reverse=True)
    
    # Take top N
    top_holdings = sorted_holdings[:top_n]
    other_value = sum(float(h[1]['total_value']) for h in sorted_holdings[top_n:])
    
    # Prepare data
    labels = []
    values = []
    colors = []
    
    # Color palette
    symbol_colors = px.colors.qualitative.Set3
    
    for i, (symbol, data) in enumerate(top_holdings):
        labels.append(symbol)
        values.append(float(data['total_value']))
        colors.append(symbol_colors[i % len(symbol_colors)])
    
    if other_value > 0:
        labels.append("Other Holdings")
        values.append(other_value)
        colors.append('#cccccc')
    
    # Create donut chart
    fig = go.Figure(data=[go.Pie(
        labels=labels,
        values=values,
        hole=0.4,
        marker=dict(colors=colors),
        textinfo='label+percent',
        textposition='auto',
        hovertemplate='<b>%{label}</b><br>Value: $%{value:,.2f}<br>Allocation: %{percent}<extra></extra>'
    )])
    
    fig.update_layout(
        title=dict(
            text=f'Portfolio Allocation - Top {top_n} Holdings + Other<br><sub>Total: ${float(total_value):,.2f}</sub>',
            x=0.5,
            xanchor='center'
        ),
        showlegend=True,
        legend=dict(orientation="v", yanchor="middle", y=0.5, xanchor="left", x=1.02),
        height=600,
        font=dict(size=12)
    )
    
    return fig


def create_top_holdings_chart(holdings: Dict[str, Any], limit: int = 20) -> go.Figure:
    """Create a horizontal bar chart of top holdings
    
    Args:
        holdings: Dict of symbol -> holding data
        limit: Number of top holdings to show
    
    Returns:
        Plotly Figure object
    """
    # Sort by value
    sorted_holdings = sorted(holdings.items(), key=lambda x: x[1]['total_value'], reverse=True)
    top_holdings = sorted_holdings[:limit]
    
    # Prepare data
    symbols = []
    values = []
    allocations = []
    
    for symbol, data in reversed(top_holdings):  # Reverse for bottom-to-top display
        symbols.append(symbol)
        values.append(float(data['total_value']))
        # Calculate allocation percentage
        allocation = float(data['total_value']) / sum(float(h[1]['total_value']) for h in sorted_holdings) * 100
        allocations.append(allocation)
    
    # Create bar chart
    fig = go.Figure(data=[go.Bar(
        x=values,
        y=symbols,
        orientation='h',
        marker=dict(
            color=allocations,
            colorscale='Blues',
            showscale=True,
            colorbar=dict(title="Allocation %")
        ),
        text=[f'${v:,.0f}' for v in values],
        textposition='outside',
        hovertemplate='<b>%{y}</b><br>Value: $%{x:,.2f}<br>Allocation: %{marker.color:.2f}%<extra></extra>'
    )])
    
    fig.update_layout(
        title=f'Top {limit} Holdings by Value',
        xaxis_title='Value ($)',
        yaxis_title='Symbol',
        height=max(400, limit * 25),
        showlegend=False,
        margin=dict(l=100, r=100),
        font=dict(size=11)
    )
    
    return fig


def create_broker_distribution_chart(holdings: Dict[str, Any]) -> go.Figure:
    """Create a treemap showing broker -> holdings distribution
    
    Args:
        holdings: Dict of symbol -> holding data
    
    Returns:
        Plotly Figure object
    """
    # Prepare hierarchical data
    labels = []
    parents = []
    values = []
    colors = []
    
    # Add root
    labels.append("Portfolio")
    parents.append("")
    total_value = sum(float(h['total_value']) for h in holdings.values())
    values.append(total_value)
    colors.append(0)
    
    # Collect broker totals
    broker_totals = {}
    for symbol, data in holdings.items():
        for broker in data['brokers']:
            if broker not in broker_totals:
                broker_totals[broker] = 0
            # Distribute value proportionally if multiple brokers
            value_per_broker = float(data['total_value']) / len(data['brokers'])
            broker_totals[broker] += value_per_broker
    
    # Add brokers
    for broker, value in broker_totals.items():
        labels.append(broker)
        parents.append("Portfolio")
        values.append(value)
        colors.append(value)
    
    # Add holdings under brokers
    for symbol, data in holdings.items():
        for broker in data['brokers']:
            labels.append(f"{symbol}<br>(${float(data['total_value']):,.0f})")
            parents.append(broker)
            # Distribute value if symbol appears in multiple brokers
            value_per_broker = float(data['total_value']) / len(data['brokers'])
            values.append(value_per_broker)
            colors.append(value_per_broker)
    
    # Create treemap
    fig = go.Figure(go.Treemap(
        labels=labels,
        parents=parents,
        values=values,
        marker=dict(
            colorscale='Blues',
            cmid=total_value/2,
            colorbar=dict(title="Value ($)")
        ),
        textinfo="label+value+percent parent",
        hovertemplate='<b>%{label}</b><br>Value: $%{value:,.2f}<br>%{percentParent}<extra></extra>'
    ))
    
    fig.update_layout(
        title=f'Portfolio Distribution by Broker<br><sub>Total: ${total_value:,.2f}</sub>',
        height=700,
        font=dict(size=12)
    )
    
    return fig


def create_concentration_chart(holdings: Dict[str, Any], total_value: Decimal) -> go.Figure:
    """Create a concentration curve showing cumulative allocation
    
    Args:
        holdings: Dict of symbol -> holding data
        total_value: Total portfolio value
    
    Returns:
        Plotly Figure object
    """
    # Sort by value
    sorted_holdings = sorted(holdings.items(), key=lambda x: x[1]['total_value'], reverse=True)
    
    # Calculate cumulative allocation
    cumulative_count = []
    cumulative_percent = []
    cumulative_value = Decimal('0')
    
    for i, (symbol, data) in enumerate(sorted_holdings, 1):
        cumulative_count.append(i)
        cumulative_value += data['total_value']
        cumulative_percent.append(float(cumulative_value / total_value * 100))
    
    # Create line chart
    fig = go.Figure()
    
    # Add main curve
    fig.add_trace(go.Scatter(
        x=cumulative_count,
        y=cumulative_percent,
        mode='lines',
        name='Cumulative Allocation',
        line=dict(color='#1f77b4', width=3),
        fill='tozeroy',
        fillcolor='rgba(31, 119, 180, 0.2)',
        hovertemplate='Top %{x} holdings = %{y:.1f}% of portfolio<extra></extra>'
    ))
    
    # Add reference lines
    reference_lines = [
        (50, 'rgb(255, 127, 14)'),
        (80, 'rgb(44, 160, 44)'),
        (90, 'rgb(214, 39, 40)')
    ]
    
    for percent, color in reference_lines:
        # Find how many holdings reach this percent
        idx = next((i for i, p in enumerate(cumulative_percent) if p >= percent), None)
        if idx is not None:
            fig.add_hline(y=percent, line_dash="dash", line_color=color, 
                         annotation_text=f"{percent}%", annotation_position="right")
            fig.add_vline(x=idx + 1, line_dash="dot", line_color=color, opacity=0.5)
    
    fig.update_layout(
        title='Portfolio Concentration Curve',
        xaxis_title='Number of Holdings',
        yaxis_title='Cumulative % of Portfolio',
        height=500,
        showlegend=False,
        font=dict(size=12),
        yaxis=dict(range=[0, 105]),
        annotations=[
            dict(
                x=len(sorted_holdings),
                y=100,
                text=f"Total: {len(sorted_holdings)} holdings",
                showarrow=False,
                xanchor='right',
                yanchor='top',
                font=dict(size=10, color='gray')
            )
        ]
    )
    
    return fig


def save_and_open_chart(fig: go.Figure, output_path: str = None, auto_open: bool = True) -> str:
    """Save chart to HTML and optionally open in browser
    
    Args:
        fig: Plotly Figure object
        output_path: Path to save HTML file (default: temp file)
        auto_open: Whether to open in browser automatically
    
    Returns:
        Path to saved HTML file
    """
    if output_path is None:
        # Create temp file
        fd, output_path = tempfile.mkstemp(suffix='.html', prefix='fenn-chart-')
        import os
        os.close(fd)
    
    # Save to HTML
    fig.write_html(output_path, include_plotlyjs='cdn')
    
    # Open in browser
    if auto_open:
        webbrowser.open(f'file://{output_path}')
    
    return output_path
