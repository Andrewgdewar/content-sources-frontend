import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ADVISORIES_ROUTE,
  CONTENT_ROUTE,
  DETAILS_ROUTE,
  PACKAGES_ROUTE,
  SYSTEMS_ROUTE,
  REPOSITORIES_ROUTE,
} from 'Routes/constants';

type ContentTabType = typeof CONTENT_ROUTE | typeof SYSTEMS_ROUTE;
type ContentSubTabType =
  | typeof PACKAGES_ROUTE
  | typeof ADVISORIES_ROUTE
  | typeof REPOSITORIES_ROUTE;

export default function TemplateDetailsTabs() {
  const { pathname } = useLocation();
  const [mainRoute, subpath] = pathname?.split(`${DETAILS_ROUTE}/`) || [];
  const baseRoute = mainRoute + `${DETAILS_ROUTE}`;
  const navigate = useNavigate();

  const [topTabKey, setTopTabKey] = useState<ContentTabType>(CONTENT_ROUTE);
  const [contentTabKey, setContentTabKey] = useState<ContentSubTabType>(PACKAGES_ROUTE);

  useEffect(() => {
    const [topTabRoute, bottomTabRoute] = subpath?.split('/') || [];

    // Update tabs on route change
    if (topTabRoute) {
      setTopTabKey(topTabRoute as ContentTabType);
      if (topTabRoute === CONTENT_ROUTE) {
        setContentTabKey((bottomTabRoute as ContentSubTabType) || PACKAGES_ROUTE);
      }
    }
  }, [subpath]);

  const navigateContentTab = (eventKey: string) => {
    if (eventKey === CONTENT_ROUTE) {
      navigate(`${baseRoute}/${eventKey}/${contentTabKey}`);
    } else {
      navigate(`${baseRoute}/${eventKey}`);
    }
  };

  return (
    <Tabs
      activeKey={topTabKey}
      onSelect={(_, eventKey) => navigateContentTab(eventKey as string)}
      aria-label='Snapshot detail tabs'
    >
      <Tab
        eventKey={CONTENT_ROUTE}
        ouiaId='content_tab'
        title={<TabTitleText>Content</TabTitleText>}
        aria-label='Template package detail tab'
      >
        <Tabs
          activeKey={contentTabKey}
          onSelect={(_, eventKey) => navigate(`${baseRoute}/${topTabKey}/${eventKey}`)}
          aria-label='Template details tab'
        >
          <Tab
            eventKey={PACKAGES_ROUTE}
            ouiaId='packages_tab'
            title={<TabTitleText>Packages</TabTitleText>}
            aria-label='Template package detail tab'
          />
          <Tab
            eventKey={ADVISORIES_ROUTE}
            ouiaId='advisories_tab'
            title={<TabTitleText>Advisories</TabTitleText>}
            aria-label='Template advisories detail tab'
          />
          <Tab
            eventKey={REPOSITORIES_ROUTE}
            ouiaId='repositories_tab'
            title={<TabTitleText>Repositories</TabTitleText>}
            aria-label='Template repositories detail tab'
          />
        </Tabs>
      </Tab>
      <Tab
        eventKey={SYSTEMS_ROUTE}
        ouiaId='systems_tab'
        title={<TabTitleText>Systems</TabTitleText>}
        aria-label='Template systems detail tab'
      />
    </Tabs>
  );
}
