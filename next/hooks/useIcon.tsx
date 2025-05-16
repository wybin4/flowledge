import { JSX, useMemo } from "react";
import AppearanceIcon from "@/assets/appearance.svg";
import ProfileIcon from "../assets/profile.svg";
import CoursesListIcon from "../assets/courses-list.svg";
import ResizeIcon from "../assets/resize.svg";
import PublicSettingsIcon from "../assets/user-settings.svg";
import PrivateSettingsIcon from "../assets/private-settings.svg";
import PermissionsIcon from "../assets/permissions.svg";
import NumberIcon from "../assets/number.svg";
import TextIcon from "../assets/text.svg";
import PasswordHideIcon from "../assets/password-hide.svg";
import PasswordShowIcon from "../assets/password-show.svg";
import AccessIcon from "../assets/access.svg";
import RightIcon from "../assets/right.svg";
import LeftIcon from "../assets/left.svg";
import NothingIcon from "../assets/nothing.svg";
import SearchIcon from "../assets/search.svg";
import SeparatorIcon from "../assets/separator.svg";
import ExpandIcon from "../assets/expand.svg";
import ExpandLittleIcon from "../assets/expand-little.svg";
import LockedIcon from "../assets/locked.svg";
import DefaultIcon from "../assets/default.svg";
import LinkIcon from "../assets/link.svg";
import PresentationIcon from "../assets/presentation.svg";
import TaskIcon from "../assets/task.svg";
import AcceptIcon from "../assets/accept.svg";
import MenuIcon from "../assets/menu.svg";
import BoldIcon from "../assets/bold.svg";
import ItalicIcon from "../assets/italic.svg";
import HrefIcon from "../assets/href.svg";
import UnderlineIcon from "../assets/underline.svg";
import HeaderIcon from "../assets/header.svg";
import CodeIcon from "../assets/code.svg";
import ImageIcon from "../assets/image.svg";
import UnorderedListIcon from "../assets/unordered-list.svg";
import OrderedListIcon from "../assets/ordered-list.svg";
import QuoteIcon from "../assets/quote.svg";
import IntegrationsIcon from "../assets/integrations.svg";
import UsersIcon from "../assets/users.svg";
import SortIcon from "../assets/sort.svg";
import FileUploadIcon from "../assets/file-upload.svg";
import SecurityIcon from "../assets/security.svg";
import CoursesHubIcon from "../assets/courses-hub.svg";
import MarkIcon from "../assets/mark.svg";
import UnmarkIcon from "../assets/unmark.svg";
import CloseIcon from "../assets/close.svg";
import CheckIcon from "../assets/check.svg";
import RoundIcon from "../assets/round.svg";
import RoundFilledIcon from "../assets/round.svg";
import RoundCheckIcon from "../assets/round-check.svg";
import RoundCheckFilledIcon from "../assets/round-check-filled.svg";
import OkIcon from "../assets/ok.svg";
import VideoIcon from "../assets/video.svg";
import VideoUploadIcon from "../assets/video-upload.svg";
import VideoUploadBorderIcon from "../assets/video-upload-border.svg";
import TopIcon from "../assets/top.svg";
import BottomIcon from "../assets/bottom.svg";
import InfoIcon from "../assets/info.svg";
import SwapIcon from "../assets/swap.svg";
import EditIcon from "../assets/edit.svg";
import DeleteIcon from "../assets/delete.svg";
import GhostIcon from "../assets/ghost.svg";
import DraggableIcon from "../assets/draggable.svg";
import RightArrowIcon from "../assets/right-arrow.svg";
import FullScreenIcon from "../assets/fullscreen.svg";
import TagIcon from "../assets/tag.svg";
import StatisticsIcon from "../assets/statistics.svg";
import OptionsIcon from "../assets/options.svg";
import LogoutIcon from "../assets/logout.svg";
import FlagIcon from "../assets/flag.svg";
import SurveyIcon from "../assets/survey.svg";

const icons = {
    'permissions': <PermissionsIcon />,
    'private-settings': <PrivateSettingsIcon />,
    'user-settings': <PublicSettingsIcon />,
    'courses-list': <CoursesListIcon />,
    'courses-hub': <CoursesHubIcon />,
    'resize': <ResizeIcon />,
    'profile': <ProfileIcon />,
    'api-integrations': <IntegrationsIcon />,
    'users': <UsersIcon />,
    'course-tags': <TagIcon />,
    'logout': <LogoutIcon />,

    'appearance': <AppearanceIcon />,
    'ldap': <AccessIcon />,
    'discover': <SearchIcon />,
    'user-default': <DefaultIcon />,
    'file-upload': <FileUploadIcon />,
    'security': <SecurityIcon />,

    'text': <TextIcon />,
    'number': <NumberIcon />,
    'link': <LinkIcon />,
    'presentation': <PresentationIcon />,
    'task': <TaskIcon />,
    'password-hide': <PasswordHideIcon />,
    'password-show': <PasswordShowIcon />,

    'accept': <AcceptIcon />,

    'right': <RightIcon />,
    'left': <LeftIcon />,
    'separator': <SeparatorIcon />,
    'expand': <ExpandIcon />,
    'expand-little': <ExpandLittleIcon />,
    'locked': <LockedIcon />,

    'nothing': <NothingIcon />,
    'menu': <MenuIcon />,
    'sort': <SortIcon />,

    'bold': <BoldIcon />,
    'italic': <ItalicIcon />,
    'href': <HrefIcon />,
    'underline': <UnderlineIcon />,
    'header': <HeaderIcon />,
    'code': <CodeIcon />,
    'image': <ImageIcon />,
    'ulist': <UnorderedListIcon />,
    'olist': <OrderedListIcon />,
    'quote': <QuoteIcon />,

    'mark': <MarkIcon />,
    'unmark': <UnmarkIcon />,
    'close': <CloseIcon />,
    'ok': <OkIcon />,
    'check': <CheckIcon />,
    'round': <RoundIcon />,
    'round-filled': <RoundFilledIcon />,
    'round-check': <RoundCheckIcon />,
    'round-check-filled': <RoundCheckFilledIcon />,

    'video': <VideoIcon />,
    'video-upload': <VideoUploadIcon />,
    'video-upload-border': <VideoUploadBorderIcon />,

    'top': <TopIcon />,
    'bottom': <BottomIcon />,

    'info': <InfoIcon />,
    'swap': <SwapIcon />,

    'edit': <EditIcon />,
    'delete': <DeleteIcon />,
    'ghost': <GhostIcon />,

    'draggable': <DraggableIcon />,

    'right-arrow': <RightArrowIcon />,
    'full-screen': <FullScreenIcon />,

    'statistics': <StatisticsIcon />,
    'options': <OptionsIcon />,

    'flag': <FlagIcon />,
    'survey': <SurveyIcon />
} as const;

export type IconKey = keyof typeof icons;

export function useIcon(tab: IconKey): JSX.Element {
    return useMemo(() => {
        return icons[tab] || <></>;
    }, [tab]);
}
