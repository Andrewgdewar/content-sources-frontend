import {
    Alert,
    ClipboardCopy,
    ClipboardCopyVariant,
    TabContent,
    Text, TextContent,
    TextList,
    TextListItem,
    TextVariants
} from '@patternfly/react-core';
import React from 'react';
import {createUseStyles} from 'react-jss';
import {useParams} from 'react-router-dom';
import {ExternalLinkAltIcon} from "@patternfly/react-icons";

export const CURL_TAB = 'curl'

const useStyles = createUseStyles({
    textGroup: {
        paddingTop: '8px',
    },
})

type Props = {
    tabContentRef:  React.RefObject<HTMLElement>
}

const CurlTab = ({ tabContentRef }: Props) => {
    const classes = useStyles();
    const { templateUUID } = useParams();

    return (
        <TabContent eventKey={CURL_TAB} id={CURL_TAB} ref={tabContentRef} hidden>
            <div className={classes.textGroup}>
                <Alert
                    variant='warning'
                    title='Consuming a template in this way will result in the system not reporting applicable errata properly within Insights.'
                    isInline
                >
                    System advisory information will not be available via {' '}
                    <a href="insights/patch/systems/" rel='noreferrer' target='_blank'>
                        Systems <ExternalLinkAltIcon/>
                    </a>
                </Alert>
            </div>
            <TextContent className={classes.textGroup}>
                <Text component={TextVariants.h2}>Register for subscriptions</Text>
                <TextList isPlain>
                    <TextListItem>
                        <Text component="h6">Register with rhc</Text>
                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied"
                                       variant={ClipboardCopyVariant.expansion}>
                            rhc connect
                        </ClipboardCopy>
                    </TextListItem>
                    <TextListItem>
                        <Text component="h6">Or register with subscription manager</Text>
                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied"
                                       variant={ClipboardCopyVariant.expansion}>
                            subscription-manager register
                        </ClipboardCopy>
                    </TextListItem>
                </TextList>
                <TextList isPlain>
                    <TextListItem>
                        <Text component={TextVariants.h2}>Download the repo file</Text>
                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied"
                                       variant={ClipboardCopyVariant.expansion}>
                            {'curl -o /etc/yum.repos.d/template.repo  https://console.redhat.com/api/content-sources/v1/templates/' + templateUUID + '/config.repo'}
                        </ClipboardCopy>
                    </TextListItem>
                </TextList>
            </TextContent>
            <div className={classes.textGroup}>
                <Alert
                    variant='info'
                    title='Adding or removing a repository from the template will not be reflected on the
                            client until the repo file is re-downloaded.'
                    isInline
                />
            </div>
        </TabContent>
    )
}

export default CurlTab;
