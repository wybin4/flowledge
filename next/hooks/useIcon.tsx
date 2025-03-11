import { JSX, useMemo } from "react";
import AppearanceIcon from "@/assets/appearance.svg";
import ProfileIcon from "../assets/profile.svg";
import CoursesIcon from "../assets/courses.svg";
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
import CollapseIcon from "../assets/collapse.svg";
import ExpandIcon from "../assets/expand.svg";
import LockedIcon from "../assets/locked.svg";
import Default from "../assets/default.svg";

const icons = {
    'permissions': <PermissionsIcon />,
    'private-settings': <PrivateSettingsIcon />,
    'user-settings': <PublicSettingsIcon />,
    'courses': <CoursesIcon />,
    'resize': <ResizeIcon />,
    'profile': <ProfileIcon />,

    'appearance': <AppearanceIcon />,
    'ldap': <AccessIcon />,
    'search': <SearchIcon />,
    'user-default': <Default />,

    'text': <TextIcon />,
    'number': <NumberIcon />,
    'password-hide': <PasswordHideIcon />,
    'password-show': <PasswordShowIcon />,

    'right': <RightIcon />,
    'left': <LeftIcon />,
    'separator': <SeparatorIcon />,
    'collapse': <CollapseIcon />,
    'expand': <ExpandIcon />,
    'locked': <LockedIcon />,

    'nothing': <NothingIcon />
} as const;

export type IconKey = keyof typeof icons;

export function useIcon(tab: IconKey): JSX.Element {
    return useMemo(() => {
        return icons[tab] || <></>;
    }, [tab]);
}
