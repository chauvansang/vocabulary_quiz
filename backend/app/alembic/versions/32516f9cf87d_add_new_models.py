"""Add new models

Revision ID: 32516f9cf87d
Revises: 1a31ce608336
Create Date: 2024-11-08 11:07:43.399898

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '32516f9cf87d'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('quiz',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('question',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('quiz_id', sa.Uuid(), nullable=False),
    sa.Column('text', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['quiz.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('quizsession',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('quiz_id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['quiz.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('answer',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('question_id', sa.Uuid(), nullable=False),
    sa.Column('text', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('is_correct', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['question_id'], ['question.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('answer')
    op.drop_table('quizsession')
    op.drop_table('question')
    op.drop_table('quiz')
    # ### end Alembic commands ###
