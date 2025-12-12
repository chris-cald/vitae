# Import all custom renderers so they are registered by default
# Explicitly import all custom renderers to ensure registration

from .create_table import render_create_table
from .create_index import render_create_index
from .add_column import render_add_column

__all__ = [
	"render_create_table",
	"render_create_index",
	"render_add_column",
]
