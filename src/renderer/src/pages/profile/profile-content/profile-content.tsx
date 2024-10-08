import { userProfileContext } from "@renderer/context";
import { useContext, useEffect, useMemo } from "react";
import { ProfileHero } from "../profile-hero/profile-hero";
import { useAppDispatch, useFormat } from "@renderer/hooks";
import { setHeaderTitle } from "@renderer/features";
import { steamUrlBuilder } from "@shared";
import { SPACING_UNIT } from "@renderer/theme.css";

import * as styles from "./profile-content.css";
import { TelescopeIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LockedProfile } from "./locked-profile";
import { ReportProfile } from "../report-profile/report-profile";
import { FriendsBox } from "./friends-box";
import { RecentGamesBox } from "./recent-games-box";
import { UserGame } from "@types";
import { buildGameDetailsPath } from "@renderer/helpers";

export function ProfileContent() {
  const { userProfile, isMe, userStats } = useContext(userProfileContext);

  const dispatch = useAppDispatch();

  const { t } = useTranslation("user_profile");

  useEffect(() => {
    dispatch(setHeaderTitle(""));

    if (userProfile) {
      dispatch(setHeaderTitle(userProfile.displayName));
    }
  }, [userProfile, dispatch]);

  const { numberFormatter } = useFormat();

  const navigate = useNavigate();

  const usersAreFriends = useMemo(() => {
    return userProfile?.relation?.status === "ACCEPTED";
  }, [userProfile]);

  const buildUserGameDetailsPath = (game: UserGame) =>
    buildGameDetailsPath({
      ...game,
      objectID: game.objectId,
    });

  const content = useMemo(() => {
    if (!userProfile) return null;

    const shouldLockProfile =
      userProfile.profileVisibility === "PRIVATE" ||
      (userProfile.profileVisibility === "FRIENDS" && !usersAreFriends);

    if (!isMe && shouldLockProfile) {
      return <LockedProfile />;
    }

    const hasGames = userProfile?.libraryGames.length > 0;

    const shouldShowRightContent = hasGames || userProfile.friends.length > 0;

    return (
      <section
        style={{
          display: "flex",
          gap: `${SPACING_UNIT * 3}px`,
          padding: `${SPACING_UNIT * 3}px`,
        }}
      >
        <div style={{ flex: 1 }}>
          {!hasGames && (
            <div className={styles.noGames}>
              <div className={styles.telescopeIcon}>
                <TelescopeIcon size={24} />
              </div>
              <h2>{t("no_recent_activity_title")}</h2>
              {isMe && <p>{t("no_recent_activity_description")}</p>}
            </div>
          )}

          {hasGames && (
            <>
              <div className={styles.sectionHeader}>
                <h2>{t("library")}</h2>

                {userStats && (
                  <span>{numberFormatter.format(userStats.libraryCount)}</span>
                )}
              </div>

              <ul className={styles.gamesGrid}>
                {userProfile?.libraryGames?.map((game) => (
                  <li
                    key={game.objectId}
                    style={{
                      borderRadius: 4,
                      overflow: "hidden",
                      position: "relative",
                    }}
                    className={styles.game}
                  >
                    <button
                      type="button"
                      style={{
                        cursor: "pointer",
                      }}
                      className={styles.gameCover}
                      onClick={() => navigate(buildUserGameDetailsPath(game))}
                    >
                      <img
                        src={steamUrlBuilder.cover(game.objectId)}
                        alt={game.title}
                        style={{
                          width: "100%",
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {shouldShowRightContent && (
          <div className={styles.rightContent}>
            <RecentGamesBox />
            <FriendsBox />

            <ReportProfile />
          </div>
        )}
      </section>
    );
  }, [
    userProfile,
    isMe,
    usersAreFriends,
    userStats,
    numberFormatter,
    t,
    navigate,
  ]);

  return (
    <div>
      <ProfileHero />

      {content}
    </div>
  );
}
