"""Initial production schema with indexes

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-07 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('USER', 'SKINCARE_CONSULTANT', 'DERMATOLOGIST', 'ADMIN', name='roleenum'), nullable=False),
        sa.Column('requested_role', sa.Enum('USER', 'SKINCARE_CONSULTANT', 'DERMATOLOGIST', 'ADMIN', name='roleenum'), nullable=True),
        sa.Column('verification_status', sa.Enum('PENDING', 'VERIFIED', 'REJECTED', name='verificationstatus'), nullable=False),
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. skin_profiles
    op.create_table(
        'skin_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skin_type', sa.Enum('NORMAL', 'DRY', 'OILY', 'COMBINATION', 'SENSITIVE', name='skintypeenum'), nullable=False),
        sa.Column('skin_concerns', sa.Text(), nullable=True),
        sa.Column('allergies', sa.Text(), nullable=True),
        sa.Column('sensitivities', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_skin_profiles_id'), 'skin_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_skin_profiles_user_id'), 'skin_profiles', ['user_id'], unique=True)

    # 3. lifestyle_profiles
    op.create_table(
        'lifestyle_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lifestyle_habits', sa.Text(), nullable=True),
        sa.Column('stress_level', sa.Enum('LOW', 'MODERATE', 'HIGH', name='stresslevelenum'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_lifestyle_profiles_id'), 'lifestyle_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_lifestyle_profiles_user_id'), 'lifestyle_profiles', ['user_id'], unique=True)

    # 4. professional_profiles
    op.create_table(
        'professional_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('professional_title', sa.String(), nullable=True),
        sa.Column('qualifications', sa.Text(), nullable=True),
        sa.Column('certifications', sa.Text(), nullable=True),
        sa.Column('years_experience', sa.Integer(), nullable=True),
        sa.Column('area_of_expertise', sa.String(), nullable=True),
        sa.Column('organization', sa.String(), nullable=True),
        sa.Column('registration_number', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('verification_docs_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_professional_profiles_id'), 'professional_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_professional_profiles_user_id'), 'professional_profiles', ['user_id'], unique=True)

    # 5. sleep_records
    op.create_table(
        'sleep_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('sleep_hours', sa.Integer(), nullable=False),
        sa.Column('sleep_quality', sa.Enum('POOR', 'AVERAGE', 'GOOD', 'EXCELLENT', name='sleepqualityenum'), nullable=False),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sleep_records_id'), 'sleep_records', ['id'], unique=False)
    op.create_index(op.f('ix_sleep_records_user_id'), 'sleep_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_sleep_records_recorded_at'), 'sleep_records', ['recorded_at'], unique=False)

    # 6. hydration_records
    op.create_table(
        'hydration_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('water_consumed', sa.Integer(), nullable=False),
        sa.Column('humidity', sa.Integer(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hydration_records_id'), 'hydration_records', ['id'], unique=False)
    op.create_index(op.f('ix_hydration_records_user_id'), 'hydration_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_hydration_records_recorded_at'), 'hydration_records', ['recorded_at'], unique=False)

    # 7. environmental_exposure
    op.create_table(
        'environmental_exposure',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('sun_exposure_hours', sa.Integer(), nullable=False),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_environmental_exposure_id'), 'environmental_exposure', ['id'], unique=False)
    op.create_index(op.f('ix_environmental_exposure_user_id'), 'environmental_exposure', ['user_id'], unique=False)
    op.create_index(op.f('ix_environmental_exposure_recorded_at'), 'environmental_exposure', ['recorded_at'], unique=False)

    # 8. skin_assessments
    op.create_table(
        'skin_assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('primary_concern', sa.String(), nullable=False),
        sa.Column('secondary_concerns', sa.Text(), nullable=True),
        sa.Column('risk_factors', sa.Text(), nullable=True),
        sa.Column('supporting_factors', sa.Text(), nullable=True),
        sa.Column('data_completeness', sa.Float(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('raw_payload', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skin_assessments_id'), 'skin_assessments', ['id'], unique=False)
    op.create_index(op.f('ix_skin_assessments_user_id'), 'skin_assessments', ['user_id'], unique=False)
    op.create_index(op.f('ix_skin_assessments_created_at'), 'skin_assessments', ['created_at'], unique=False)

    # 9. skin_health_scores
    op.create_table(
        'skin_health_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=True),
        sa.Column('total_score', sa.Integer(), nullable=False),
        sa.Column('skin_condition_score', sa.Integer(), nullable=False),
        sa.Column('lifestyle_score', sa.Integer(), nullable=False),
        sa.Column('sleep_score', sa.Integer(), nullable=False),
        sa.Column('routine_consistency_score', sa.Integer(), nullable=False),
        sa.Column('hydration_score', sa.Integer(), nullable=False),
        sa.Column('score_breakdown', sa.Text(), nullable=True),
        sa.Column('top_impact_factors', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['skin_assessments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skin_health_scores_id'), 'skin_health_scores', ['id'], unique=False)
    op.create_index(op.f('ix_skin_health_scores_user_id'), 'skin_health_scores', ['user_id'], unique=False)
    op.create_index(op.f('ix_skin_health_scores_assessment_id'), 'skin_health_scores', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_skin_health_scores_created_at'), 'skin_health_scores', ['created_at'], unique=False)

    # 10. skincare_routines
    op.create_table(
        'skincare_routines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=True),
        sa.Column('morning_routine', sa.Text(), nullable=False),
        sa.Column('evening_routine', sa.Text(), nullable=False),
        sa.Column('weekly_routine', sa.Text(), nullable=True),
        sa.Column('seasonal_notes', sa.Text(), nullable=True),
        sa.Column('safety_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['skin_assessments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skincare_routines_id'), 'skincare_routines', ['id'], unique=False)
    op.create_index(op.f('ix_skincare_routines_user_id'), 'skincare_routines', ['user_id'], unique=False)
    op.create_index(op.f('ix_skincare_routines_assessment_id'), 'skincare_routines', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_skincare_routines_created_at'), 'skincare_routines', ['created_at'], unique=False)

    # 11. recommendations
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=True),
        sa.Column('recommendation_type', sa.String(), nullable=False),
        sa.Column('ingredient_or_category', sa.String(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('user_factor_trigger', sa.String(), nullable=True),
        sa.Column('target_concern', sa.String(), nullable=True),
        sa.Column('precautions', sa.Text(), nullable=True),
        sa.Column('evidence_reference', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['skin_assessments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_recommendations_user_id'), 'recommendations', ['user_id'], unique=False)
    op.create_index(op.f('ix_recommendations_assessment_id'), 'recommendations', ['assessment_id'], unique=False)
    op.create_index(op.f('ix_recommendations_created_at'), 'recommendations', ['created_at'], unique=False)

    # 12. ingredient_evidence
    op.create_table(
        'ingredient_evidence',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ingredient_name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('primary_benefits', sa.Text(), nullable=False),
        sa.Column('suitable_skin_types', sa.Text(), nullable=False),
        sa.Column('target_concerns', sa.Text(), nullable=False),
        sa.Column('conflicting_ingredients', sa.Text(), nullable=True),
        sa.Column('sensitivity_warnings', sa.Text(), nullable=True),
        sa.Column('evidence_level', sa.String(), nullable=False, server_default='High (Peer-Reviewed / Clinical)'),
        sa.Column('source_reference', sa.Text(), nullable=False),
        sa.Column('review_date', sa.String(), nullable=True, server_default='2026-01-01'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ingredient_evidence_id'), 'ingredient_evidence', ['id'], unique=False)
    op.create_index(op.f('ix_ingredient_evidence_ingredient_name'), 'ingredient_evidence', ['ingredient_name'], unique=True)

    # 13. products
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('brand', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('ingredients', sa.Text(), nullable=False),
        sa.Column('active_ingredients', sa.Text(), nullable=False),
        sa.Column('skin_types', sa.Text(), nullable=False),
        sa.Column('skin_concerns', sa.Text(), nullable=False),
        sa.Column('fragrance_free', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('alcohol_free', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('cruelty_free', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('status', sa.String(), nullable=False, server_default='ACTIVE'),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index(op.f('ix_products_brand'), 'products', ['brand'], unique=False)
    op.create_index(op.f('ix_products_category'), 'products', ['category'], unique=False)

    # 14. product_recommendations
    op.create_table(
        'product_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('suitability_score', sa.Integer(), nullable=False),
        sa.Column('recommended', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('reasons', sa.Text(), nullable=False),
        sa.Column('potential_conflicts', sa.Text(), nullable=True),
        sa.Column('matching_concerns', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_recommendations_id'), 'product_recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_product_recommendations_user_id'), 'product_recommendations', ['user_id'], unique=False)
    op.create_index(op.f('ix_product_recommendations_product_id'), 'product_recommendations', ['product_id'], unique=False)

    # 15. progress_records
    op.create_table(
        'progress_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=True),
        sa.Column('total_score', sa.Integer(), nullable=False),
        sa.Column('skin_condition_score', sa.Integer(), nullable=False),
        sa.Column('lifestyle_score', sa.Integer(), nullable=False),
        sa.Column('sleep_score', sa.Integer(), nullable=False),
        sa.Column('routine_consistency_score', sa.Integer(), nullable=False),
        sa.Column('hydration_score', sa.Integer(), nullable=False),
        sa.Column('concern_levels', sa.Text(), nullable=True),
        sa.Column('barrier_status', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['skin_assessments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_progress_records_id'), 'progress_records', ['id'], unique=False)
    op.create_index(op.f('ix_progress_records_user_id'), 'progress_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_progress_records_recorded_at'), 'progress_records', ['recorded_at'], unique=False)

    # 16. routine_adherence_records
    op.create_table(
        'routine_adherence_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.String(), nullable=False),
        sa.Column('morning_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('evening_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('completed_steps', sa.Text(), nullable=True),
        sa.Column('missed_steps', sa.Text(), nullable=True),
        sa.Column('adherence_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_routine_adherence_records_id'), 'routine_adherence_records', ['id'], unique=False)
    op.create_index(op.f('ix_routine_adherence_records_user_id'), 'routine_adherence_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_routine_adherence_records_date'), 'routine_adherence_records', ['date'], unique=False)

    # 17. consultations
    op.create_table(
        'consultation_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('professional_id', sa.Integer(), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('primary_concern', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='PENDING'),
        sa.Column('response_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['professional_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_consultation_requests_id'), 'consultation_requests', ['id'], unique=False)
    op.create_index(op.f('ix_consultation_requests_client_id'), 'consultation_requests', ['client_id'], unique=False)
    op.create_index(op.f('ix_consultation_requests_professional_id'), 'consultation_requests', ['professional_id'], unique=False)
    op.create_index(op.f('ix_consultation_requests_status'), 'consultation_requests', ['status'], unique=False)
    op.create_index(op.f('ix_consultation_requests_created_at'), 'consultation_requests', ['created_at'], unique=False)

    # 18. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.Enum('AM_ROUTINE', 'PM_ROUTINE', 'HYDRATION', 'SLEEP', 'REPLENISHMENT', 'MILESTONE', 'SYSTEM', name='notificationtypeenum'), nullable=False),
        sa.Column('priority', sa.Enum('LOW', 'NORMAL', 'HIGH', 'URGENT', name='notificationpriorityenum'), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('read_at', sa.DateTime(), nullable=True),
        sa.Column('action_url', sa.String(length=255), nullable=True),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)
    op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)
    op.create_index(op.f('ix_notifications_notification_type'), 'notifications', ['notification_type'], unique=False)

    # 19. notification_preferences
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('in_app_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('am_routine_reminder', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('pm_routine_reminder', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('hydration_reminder', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('sleep_reminder', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('replenishment_reminder', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('milestone_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('quiet_hours_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('quiet_hours_start', sa.String(length=10), nullable=True, server_default='22:00'),
        sa.Column('quiet_hours_end', sa.String(length=10), nullable=True, server_default='07:00'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_notification_preferences_id'), 'notification_preferences', ['id'], unique=False)
    op.create_index(op.f('ix_notification_preferences_user_id'), 'notification_preferences', ['user_id'], unique=True)

    # 20. auth tokens
    op.create_table(
        'email_verification_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_email_verification_tokens_id'), 'email_verification_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_email_verification_tokens_user_id'), 'email_verification_tokens', ['user_id'], unique=False)
    op.create_index(op.f('ix_email_verification_tokens_token'), 'email_verification_tokens', ['token'], unique=True)
    op.create_index(op.f('ix_email_verification_tokens_created_at'), 'email_verification_tokens', ['created_at'], unique=False)

    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_tokens_user_id'), 'password_reset_tokens', ['user_id'], unique=False)
    op.create_index(op.f('ix_password_reset_tokens_token_hash'), 'password_reset_tokens', ['token_hash'], unique=True)
    op.create_index(op.f('ix_password_reset_tokens_created_at'), 'password_reset_tokens', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_table('password_reset_tokens')
    op.drop_table('email_verification_tokens')
    op.drop_table('notification_preferences')
    op.drop_table('notifications')
    op.drop_table('consultation_requests')
    op.drop_table('routine_adherence_records')
    op.drop_table('progress_records')
    op.drop_table('product_recommendations')
    op.drop_table('products')
    op.drop_table('ingredient_evidence')
    op.drop_table('recommendations')
    op.drop_table('skincare_routines')
    op.drop_table('skin_health_scores')
    op.drop_table('skin_assessments')
    op.drop_table('environmental_exposure')
    op.drop_table('hydration_records')
    op.drop_table('sleep_records')
    op.drop_table('professional_profiles')
    op.drop_table('lifestyle_profiles')
    op.drop_table('skin_profiles')
    op.drop_table('users')
