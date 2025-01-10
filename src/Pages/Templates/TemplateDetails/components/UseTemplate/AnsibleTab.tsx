import {
    Alert,
    ClipboardCopy,
    ClipboardCopyButton,
    ClipboardCopyVariant, CodeBlock, CodeBlockAction, CodeBlockCode,
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

export const ANSIBLE_TAB = 'ansible'

const useStyles = createUseStyles({
    textGroup: {
        paddingTop: '8px',
    },
})

type Props = {
    tabContentRef:  React.RefObject<HTMLElement>
}

const playbook1 = `---
- hosts: all
  tasks:
    - name: Download template.repo
      ansible.builtin.get_url:
        url: https://console.redhat.com/api/content-sources/v1/templates/`
const playbook2 = `/config.repo
        dest: /etc/yum.repos.d/template.repo
        mode: '0444'
        client_cert: /etc/pki/consumer/cert.pem
        client_key:  /etc/pki/consumer/cert.key
`

const AnsibleTab = ({ tabContentRef }: Props) => {
    const classes = useStyles();
    const { templateUUID } = useParams();
    const [copied, setCopied] = React.useState(false);

    const clipboardCopyFunc = (event, text) => {
        navigator.clipboard.writeText(text.toString());
    };

    const onClick = (event, text) => {
        clipboardCopyFunc(event, text);
        setCopied(true);
    };

    const actions = (
        <React.Fragment>
            <CodeBlockAction>
                <ClipboardCopyButton
                    id="basic-copy-button"
                    textId="code-content"
                    aria-label="Copy to clipboard"
                    onClick={(e) => onClick(e, playbook1+`${templateUUID}`+playbook2)}
                    exitDelay={copied ? 1500 : 600}
                    maxWidth="110px"
                    variant="plain"
                    onTooltipHidden={() => setCopied(false)}
                >
                    {copied ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
                </ClipboardCopyButton>
            </CodeBlockAction>
        </React.Fragment>
    );

    return (
        <TabContent eventKey={ANSIBLE_TAB} id={ANSIBLE_TAB} ref={tabContentRef} hidden>
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
                        <Text component={TextVariants.h2}>Use this ansible playbook to download the repo file</Text>
                        <CodeBlock actions={actions}>
                            <CodeBlockCode>
                                {playbook1 + `${templateUUID}` + playbook2}
                            </CodeBlockCode>
                        </CodeBlock>
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

export default AnsibleTab;
