import { render } from '@testing-library/react';
import PackageCount from './PackageCount';

it('Render PackageCount for Invalid state', async () => {
  const data = {
    uuid: '',
    name: '',
    package_count: 100,
    url: '',
    status: 'Invalid',
    account_id: '',
    distribution_arch: '',
    gpg_key: '',
    distribution_versions: [''],
    last_introspection_error: '',
    metadata_verification: false,
    org_id: 'acme',
  };
  const { queryByText } = render(<PackageCount rowData={data} />);

  expect(queryByText('N/A')).toBeInTheDocument();
});

it('Render PackageCount for Pending state', () => {
  const data = {
    uuid: '',
    name: '',
    package_count: 0,
    url: '',
    status: 'Pending',
    account_id: '',
    distribution_arch: '',
    gpg_key: '',
    distribution_versions: [''],
    last_introspection_error: '',
    metadata_verification: false,
    org_id: 'acme',
  };
  const { queryByText } = render(<PackageCount rowData={data} />);

  expect(queryByText('N/A')).toBeInTheDocument();
});

it('Render PackageCount normally', () => {
  const data = {
    uuid: '88a8417e-65ab-11ed-b54c-482ae3863d30',
    name: 'My test repository',
    package_count: 100,
    url: 'https://www.example.test/my-repository',
    status: 'Valid',
    account_id: '',
    distribution_arch: 'x86_64',
    gpg_key: '',
    distribution_versions: ['el8'],
    last_introspection_error: '',
    metadata_verification: false,
    org_id: 'acme',
  };
  const { queryByText } = render(<PackageCount rowData={data} />);

  expect(queryByText('100')).toBeInTheDocument();
});
