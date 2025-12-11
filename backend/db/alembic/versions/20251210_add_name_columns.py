"""
Add required 'name' columns to resume, job, and jobfit tables
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "add_name_columns_20251210"
down_revision = "d70cf1cb5c5e"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "resume",
        sa.Column("name", sa.String(), nullable=False, server_default="Unnamed Resume"),
    )
    op.add_column(
        "job",
        sa.Column("name", sa.String(), nullable=False, server_default="Unnamed Job"),
    )
    op.add_column(
        "jobfit",
        sa.Column(
            "name", sa.String(), nullable=False, server_default="Unnamed Analysis"
        ),
    )
    # Remove server_default after migration if desired


def downgrade():
    op.drop_column("resume", "name")
    op.drop_column("job", "name")
    op.drop_column("jobfit", "name")
