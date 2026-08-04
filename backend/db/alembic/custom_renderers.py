
# --- Custom renderer to insert smart_alembic import ---
from alembic.autogenerate import renderers
from alembic.operations.ops import UpgradeOps

def render_upgrade_ops(autogen_context, upgrade_ops):
	# Insert our custom import at the top of the migration script
	lines = [
		"from db.alembic.smart_alembic import op\n"
	]
	# Render the rest of the upgrade operations as usual
	lines.append(renderers._orig_render_upgrade_ops(autogen_context, upgrade_ops))
	return "".join(lines)

# Patch the default render_upgrade_ops to insert our import
if not hasattr(renderers, '_orig_render_upgrade_ops'):
	renderers._orig_render_upgrade_ops = renderers.render_upgrade_ops
	renderers.render_upgrade_ops = render_upgrade_ops
