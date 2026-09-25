from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.cart import NotificationResponse, NotificationCreate
from app.repositories.interaction import NotificationRepository
from app.dependencies.auth import get_current_user, get_current_admin
from app.models.profile import Profile
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    unread_only: bool = False,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves notification inbox list for the current user.
    """
    notif_repo = NotificationRepository(db)
    return notif_repo.get_user_notifications(current_user.id, unread_only=unread_only)

@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_as_read(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks all notifications in the user's inbox as read.
    """
    notif_repo = NotificationRepository(db)
    notif_repo.mark_all_read(current_user.id)
    return {"success": True, "message": "All notifications marked as read"}

@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: UUID,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks a single notification as read.
    """
    notif_repo = NotificationRepository(db)
    notification = notif_repo.get(notification_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
    # Check ownership
    if notification.profile_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    notification.is_read = True
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_notification(
    req: NotificationCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Creates a new notification for a specific user. Restricted to Admins/System triggers.
    """
    notif_repo = NotificationRepository(db)
    return notif_repo.create(req)
