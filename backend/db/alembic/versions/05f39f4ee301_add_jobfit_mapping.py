"""
Revision ID: 05f39f4ee301
Revises: a4920ce6b040
Create Date: 2025-12-19 17:50:12.345678

"""

from alembic import op
import sqlalchemy as sa
# revision identifiers, used by Alembic.
revision = "05f39f4ee301"
down_revision = "a4920ce6b040"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "jobrequirementmapping",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "resume_id", sa.String(), sa.ForeignKey("resume.resume_id"), nullable=False
        ),
        sa.Column("job_id", sa.String(), sa.ForeignKey("job.job_id"), nullable=False),
        sa.Column("requirements", sa.JSON(), nullable=False),
    )
    with op.batch_alter_table("jobfit", schema=None) as batch_op:
        batch_op.add_column(sa.Column("mapping_id", sa.String(), nullable=False))
        batch_op.create_foreign_key(
            "fk_job_resume_id", "resume", ["resume_id"], ["resume_id"]
        )
        batch_op.create_foreign_key("fk_job_job_id", "job", ["job_id"], ["job_id"])
        batch_op.create_foreign_key(
            "fk_jobfit_mapping_id",
            "jobrequirementmapping",
            ["mapping_id"],
            ["id"],
        )


def downgrade():
    with op.batch_alter_table("jobfit", schema=None) as batch_op:
        batch_op.drop_constraint("fk_jobfit_mapping_id", type_="foreignkey")
        batch_op.drop_column("mapping_id")

    op.drop_table("jobrequirementmapping")
